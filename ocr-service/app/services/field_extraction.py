import re
from typing import Any


def normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n+", "\n", text)
    return text.strip()


def clean_value(value: str) -> str:
    value = normalize_text(value)
    value = value.strip(" :-.,;•")
    return value.strip()


def get_search_text(
    detections: list[dict],
) -> str:
    return "\n".join(
        str(item.get("text", ""))
        for item in detections
        if item.get("text")
    )


def extract_mrp(
    text: str,
    detections: list[dict] | None = None,
) -> float | None:
    def parse_numeric_value(
        value: str,
    ) -> float | None:
        value = value.strip()
        value = value.replace(",", "")

        value = re.sub(
            r"^(?:₹|RS\.?|INR)\s*",
            "",
            value,
            flags=re.IGNORECASE,
        )

        match = re.fullmatch(
            r"\d{1,6}(?:\.\d{1,2})?",
            value,
        )

        if not match:
            return None

        try:
            number = float(value)
        except ValueError:
            return None

        if number <= 0 or number > 100000:
            return None

        return number

    def parse_currency_value(
        value: str,
    ) -> float | None:
        value = value.strip()
        value = value.replace(",", "")

        match = re.fullmatch(
            r"(?:₹|RS\.?|INR)\s*(\d{1,6}(?:\.\d{1,2})?)",
            value,
            re.IGNORECASE,
        )

        if not match:
            return None

        try:
            number = float(match.group(1))
        except ValueError:
            return None

        if number <= 0 or number > 100000:
            return None

        return number

    def is_unit_value(
        value: str,
    ) -> bool:
        return bool(
            re.search(
                r"(?:KG|KGS|G|GM|GMS|GRAM|GRAMS|"
                r"MG|ML|L|LTR|LITRE|LITRES|"
                r"PCS|PC|PIECE|PIECES|KCAL)\b",
                value,
                re.IGNORECASE,
            )
        )

    def is_mrp_label(
        value: str,
    ) -> bool:
        normalized = re.sub(
            r"[^A-Z]",
            "",
            value.upper(),
        )

        return normalized in {
            "MRP",
            "MAXRETAILPRICE",
        }

    normalized = normalize_text(text)

    explicit_patterns = [
        r"(?<![A-Z])M\s*\.?\s*R\s*\.?\s*P\s*\.?\s*(?:[:\-]|\s)*"
        r"(?:₹|RS\.?|INR)?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",

        r"(?<![A-Z])MAX\s*\.?\s*RETAIL\s*\.?\s*PRICE\s*(?:[:\-]|\s)*"
        r"(?:₹|RS\.?|INR)?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",

        r"(?<![A-Z])MRP\s*(?:₹|RS\.?|INR)\s*[:\-]?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",
    ]

    for pattern in explicit_patterns:
        for match in re.finditer(
            pattern,
            normalized,
            re.IGNORECASE,
        ):
            try:
                value = float(
                    match.group(1)
                )
            except ValueError:
                continue

            if 0 < value <= 100000:
                return value

    if not detections:
        return None

    cleaned_detections = []

    for index, detection in enumerate(
        detections
    ):
        raw = str(
            detection.get(
                "text",
                "",
            )
        ).strip()

        if not raw:
            continue

        confidence = float(
            detection.get(
                "confidence",
                0,
            )
        )

        bbox = detection.get(
            "bbox"
        )

        if bbox is None or len(bbox) < 4:
            continue

        try:
            x1, y1, x2, y2 = [
                float(value)
                for value in bbox[:4]
            ]
        except (
            TypeError,
            ValueError,
        ):
            continue

        cleaned_detections.append(
            {
                "index": index,
                "text": raw,
                "upper": raw.upper(),
                "confidence": confidence,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "width": max(
                    x2 - x1,
                    1.0,
                ),
                "height": max(
                    y2 - y1,
                    1.0,
                ),
                "center_x": (
                    x1 + x2
                ) / 2,
                "center_y": (
                    y1 + y2
                ) / 2,
            }
        )

    if not cleaned_detections:
        return None

    label_detections = [
        detection
        for detection in cleaned_detections
        if is_mrp_label(
            detection["text"]
        )
    ]

    candidates = []

    for label in label_detections:
        for detection in cleaned_detections:
            if (
                detection["index"]
                == label["index"]
            ):
                continue

            value = parse_numeric_value(
                detection["text"]
            )

            if value is None:
                continue

            if is_unit_value(
                detection["text"]
            ):
                continue

            index_distance = abs(
                detection["index"]
                - label["index"]
            )

            if index_distance > 4:
                continue

            vertical_distance = abs(
                detection["center_y"]
                - label["center_y"]
            )

            horizontal_distance = abs(
                detection["center_x"]
                - label["center_x"]
            )

            label_height = max(
                label["height"],
                1.0,
            )

            same_line = (
                vertical_distance
                <= label_height * 1.5
            )

            directly_right = (
                detection["center_x"]
                >= label["center_x"]
                and horizontal_distance
                <= label_height * 15
                and vertical_distance
                <= label_height * 2
            )

            directly_below = (
                detection["center_y"]
                >= label["center_y"]
                and vertical_distance
                <= label_height * 4.5
                and horizontal_distance
                <= label_height * 15
            )

            if not (
                same_line
                or directly_right
                or directly_below
            ):
                continue

            distance_score = (
                1.0
                / (
                    1.0
                    + (
                        vertical_distance
                        + horizontal_distance
                    )
                    / label_height
                )
            )

            index_score = (
                1.0
                / (
                    1.0
                    + index_distance
                )
            )

            confidence_score = min(
                max(
                    detection["confidence"],
                    0.0,
                ),
                1.0,
            )

            relation_bonus = 0.0

            if same_line:
                relation_bonus += 0.20

            if directly_right:
                relation_bonus += 0.10

            if directly_below:
                relation_bonus += 0.05

            score = (
                confidence_score * 0.35
                + distance_score * 0.25
                + index_score * 0.20
                + relation_bonus
            )

            candidates.append(
                {
                    "value": value,
                    "score": score,
                    "confidence": confidence_score,
                    "index_distance": index_distance,
                }
            )

    if candidates:
        candidates.sort(
            key=lambda item: (
                item["score"],
                item["confidence"],
                -item["index_distance"],
            ),
            reverse=True,
        )

        best = candidates[0]

        if (
            best["score"] >= 0.55
            and best["confidence"] >= 0.50
        ):
            return best["value"]

    combined_patterns = [
        r"MRP\s*[:\-]?\s*(?:₹|RS\.?|INR)?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",

        r"M\.?\s*R\.?\s*P\.?\s*[:\-]?\s*"
        r"(?:₹|RS\.?|INR)?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",

        r"MAX\s*RETAIL\s*PRICE\s*[:\-]?\s*"
        r"(?:₹|RS\.?|INR)?\s*"
        r"(\d{1,6}(?:\.\d{1,2})?)",
    ]

    for start in range(
        len(cleaned_detections)
    ):
        parts = []

        for end in range(
            start,
            min(
                start + 4,
                len(cleaned_detections),
            ),
        ):
            parts.append(
                cleaned_detections[end][
                    "text"
                ]
            )

            combined = " ".join(parts)

            for pattern in combined_patterns:
                match = re.search(
                    pattern,
                    combined,
                    re.IGNORECASE,
                )

                if match:
                    try:
                        value = float(
                            match.group(1)
                        )
                    except ValueError:
                        continue

                    if 0 < value <= 100000:
                        return value

    currency_candidates = []

    for detection in cleaned_detections:
        raw = detection["text"]

        value = parse_currency_value(
            raw
        )

        if value is None:
            continue

        if is_unit_value(raw):
            continue

        currency_candidates.append(
            {
                "value": value,
                "confidence": detection[
                    "confidence"
                ],
            }
        )

    if len(currency_candidates) == 1:
        candidate = currency_candidates[0]

        if candidate["confidence"] >= 0.80:
            return candidate["value"]

    return None




def extract_net_quantity(
    text: str,
) -> dict[str, Any] | None:
    unit_pattern = (
        r"KG|KGS|G|GM|GMS|GRAM|GRAMS|"
        r"MG|ML|L|LTR|LITRE|LITRES|"
        r"PCS|PC|PIECE|PIECES"
    )

    patterns = [
        rf"(?:NET\s*(?:QTY|QUANTITY|WEIGHT)|NET\s*CONTENTS?)"
        rf"\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*({unit_pattern})\b",

        rf"(?:NET\s*(?:QTY|QUANTITY|WEIGHT)|NET\s*CONTENTS?)"
        rf"\s*[:\-]?\s*({unit_pattern})\s*(\d+(?:\.\d+)?)\b",
    ]

    unit_map = {
        "KG": "kg",
        "KGS": "kg",
        "G": "g",
        "GM": "g",
        "GMS": "g",
        "GRAM": "g",
        "GRAMS": "g",
        "MG": "mg",
        "ML": "ml",
        "L": "l",
        "LTR": "l",
        "LITRE": "l",
        "LITRES": "l",
        "PC": "pcs",
        "PCS": "pcs",
        "PIECE": "pcs",
        "PIECES": "pcs",
    }

    for pattern_index, pattern in enumerate(patterns):
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        if pattern_index == 0:
            value_text = match.group(1)
            unit_text = match.group(2)
        else:
            unit_text = match.group(1)
            value_text = match.group(2)

        try:
            value = float(value_text)
        except ValueError:
            continue

        unit = unit_map.get(
            unit_text.upper(),
            unit_text.lower(),
        )

        return {
            "value": value,
            "unit": unit,
        }

    fallback_patterns = [
        r"\b(\d+(?:\.\d+)?)\s*(ML|L|LTR|LITRE|LITRES|KG|G|GM|MG)\b",
    ]

    quantity_context = re.search(
        r"(?:NET\s*(?:QTY|QUANTITY|WEIGHT|CONTENT|CONTENTS?)|ETNT)"
        r".{0,80}",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if quantity_context:
        context = quantity_context.group(0)

        for pattern in fallback_patterns:
            match = re.search(
                pattern,
                context,
                re.IGNORECASE,
            )

            if not match:
                continue

            try:
                value = float(match.group(1))
            except ValueError:
                continue

            unit = unit_map.get(
                match.group(2).upper(),
                match.group(2).lower(),
            )

            return {
                "value": value,
                "unit": unit,
            }

    return None


def extract_manufacturer(
    text: str,
) -> str | None:
    normalized = normalize_text(text)

    patterns = [
        r"(?:MANUFACTURED\s*(?:AND|&)\s*MARKETED\s*BY|"
        r"MANUFACTURED\s+BY|"
        r"MANUFACTURED\s+AND\s+MARKETED\s+BY|"
        r"MANUFACTURED\s*&\s*MARKETED\s+BY|"
        r"MANUFACTURED\s+MARKETED\s+BY|"
        r"MANUFACTURER|"
        r"MANOFACTURED\s+BY|"
        r"MFD\.?\s*BY|"
        r"MARKETED\s+BY|"
        r"MANUFACTURED\s+&\s*MARKETED)"
        r"\s*[:\-]?\s*"
        r"(.+?)(?=\n|"
        r"\bPACKED\s+BY\b|"
        r"\bPACKER\b|"
        r"\bIMPORTED\s+BY\b|"
        r"\bIMPORTER\b|"
        r"\bMRP\b|"
        r"\bNET\s*(?:QTY|QUANTITY|WEIGHT|CONTENT|CONTENTS)\b|"
        r"\bUBD\b|"
        r"\bUSE\s+BY\b|$)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            normalized,
            re.IGNORECASE | re.DOTALL,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        value = re.sub(
            r"\s+",
            " ",
            value,
        )

        value = re.split(
            r"\b(?:PLOT|ADDRESS|WEBSITE|LIC\.?\s*NO|FSSAI|"
            r"CUSTOMER\s+CARE|CONSUMER\s+CARE)\b",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        value = clean_value(value)

        if value and len(value) <= 180:
            return value

    lines = [
        clean_value(line)
        for line in normalized.splitlines()
        if clean_value(line)
    ]

    for index, line in enumerate(lines):
        upper = line.upper()

        if re.search(
            r"\b(?:MARKETED|MANUFACTURED|MANUFACTURED\s*&\s*MARKETED)\b",
            upper,
        ):
            candidate = re.sub(
                r"^.*?\b(?:BY|B[YT]|MY)\b\s*[:\-]?\s*",
                "",
                line,
                flags=re.IGNORECASE,
            )

            candidate = clean_value(candidate)

            if candidate and len(candidate) > 4:
                return candidate

            if index + 1 < len(lines):
                next_line = clean_value(
                    lines[index + 1]
                )

                if next_line:
                    return next_line

    organization_patterns = [
        r"\b[A-Z][A-Za-z&.,'()\- ]{3,120}\b(?:"
        r"CO[\s\-]*OPERATIVE|"
        r"COOPERATIVE|"
        r"FEDERATION|"
        r"FOODS?|"
        r"DAIRY|"
        r"MILK\s+MARKETING|"
        r"INDUSTRIES|"
        r"PRIVATE\s+LIMITED|"
        r"PVT\.?\s*LTD\.?|"
        r"LIMITED|"
        r"LTD\.?"
        r")\b",
    ]

    candidates = []

    for line in lines:
        if len(line) < 6 or len(line) > 140:
            continue

        upper = line.upper()

        if re.search(
            r"\b(?:PLOT|SECTOR|ROAD|ROAD,|GURUGRAM|ANAND|PIN|"
            r"ZIP|WEBSITE|LIC\.?\s*NO|FSSAI|CUSTOMER|"
            r"EMAIL|PHONE|TOLL\s*FREE)\b",
            upper,
        ):
            continue

        if re.search(
            r"\b(?:CO[\s\-]*OPERATIVE|COOPERATIVE|FEDERATION|"
            r"MILK\s+MARKETING|DAIRY|PVT\.?\s*LTD|"
            r"PRIVATE\s+LIMITED|INDUSTRIES|LIMITED|LTD)\b",
            upper,
        ):
            candidates.append(line)

    if candidates:
        return candidates[0]

    for pattern in organization_patterns:
        match = re.search(
            pattern,
            normalized,
            re.IGNORECASE,
        )

        if match:
            value = clean_value(
                match.group(0)
            )

            if value and len(value) <= 140:
                return value

    return None


def extract_packer(
    text: str,
) -> str | None:
    patterns = [
        r"(?:PACKED\s+BY|PACKER)"
        r"\s*[:\-]?\s*"
        r"(.+?)(?="
        r"\bMANUFACTURED\b|"
        r"\bMFD\b|"
        r"\bIMPORTED\b|"
        r"\bIMPORTER\b|"
        r"\bMRP\b|"
        r"\bNET\s*(?:QTY|QUANTITY|WEIGHT)\b|$)",

        r"MFD\.?\s*AND\s*/?\s*OR\s*PKD\.?\s*BY"
        r"\s*[:\-]?\s*"
        r"(.+?)(?="
        r"\bMRP\b|"
        r"\bNET\s*(?:QTY|QUANTITY|WEIGHT)\b|"
        r"\bBEST\s+BEFORE\b|"
        r"\bCONTAINS\b|$)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL,
        )

        if match:
            value = clean_value(
                match.group(1)
            )

            value = re.sub(
                r"^[•·\-:]+\s*",
                "",
                value,
            )

            value = re.sub(
                r"\s+",
                " ",
                value,
            )

            value = value.strip(
                " :-.,;•"
            )

            if value:
                return value

    return None


def extract_importer(
    text: str,
) -> str | None:
    pattern = (
        r"(?:IMPORTED\s+BY|"
        r"IMPORTER)"
        r"\s*[:\-]?\s*"
        r"(.+?)(?=\n|"
        r"\bMANUFACTURED\b|"
        r"\bMFD\b|"
        r"\bPACKED\b|"
        r"\bPACKER\b|"
        r"\bMRP\b|"
        r"\bNET\s*(?:QTY|QUANTITY|WEIGHT)\b|$)"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if match:
        value = clean_value(
            match.group(1)
        )

        if value:
            return value

    return None



def extract_date(
    text: str,
    keywords: list[str],
) -> str | None:
    keyword_pattern = "|".join(
        re.escape(keyword)
        for keyword in keywords
    )

    date_pattern = (
        r"\d{1,2}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{2,4}"
        r"|"
        r"\d{1,2}\s*[\/\-.]\s*\d{4}"
        r"|"
        r"\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}"
        r"|"
        r"\d{1,2}\s*[A-Za-z]{3,9}\s*\d{2,4}"
    )

    pattern = (
        rf"(?:{keyword_pattern})"
        r"\s*(?:DATE|DATED|ON)?"
        r"\s*[:\-]?\s*"
        rf"({date_pattern})"
    )

    match = re.search(
        pattern,
        text,
        re.IGNORECASE,
    )

    if match:
        return clean_value(
            match.group(1)
        ).replace(".", "/")

    return None


def extract_best_before(
    text: str,
) -> str | None:
    patterns = [
        r"(?:BEST\s+BEFORE|"
        r"BEST\s+BEFORE\s+USE)"
        r"\s*[:\-]?\s*"
        r"("
        r"\d{1,2}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{2,4}"
        r"|"
        r"\d{1,2}\s*[\/\-.]\s*\d{4}"
        r"|"
        r"\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}"
        r"|"
        r"[A-Za-z]+\s+\d{2,4}"
        r")",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = clean_value(
                match.group(1)
            ).replace(".", "/")

            if value:
                return value

    return None


def extract_use_by(
    text: str,
) -> str | None:
    patterns = [
        r"(?:USE\s*[-]?\s*BY|"
        r"USE\s+BEFORE|"
        r"UBD|"
        r"EXP(?:IRY)?|"
        r"CONSUME\s+BEFORE)"
        r"\s*(?:DATE|DATED|ON)?"
        r"\s*[:\-]?\s*"
        r"("
        r"\d{1,2}\s*[\/\-.]\s*\d{1,2}\s*[\/\-.]\s*\d{2,4}"
        r"|"
        r"\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}"
        r"|"
        r"\d{1,2}\s*[\/\-.]\s*\d{4}"
        r"|"
        r"\d{1,2}\s+[A-Za-z]+\s+\d{2,4}"
        r")",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = clean_value(
                match.group(1)
            ).replace(".", "/")

            if value:
                return value

    return None



def extract_consumer_care(
    text: str,
) -> str | None:
    values = []

    labeled_patterns = [
        r"(?:CUSTOMER\s+CARE|"
        r"CONSUMER\s+CARE|"
        r"CONSUMER\s+SERVICE|"
        r"CONSUMER\s+CARE\s+CELL|"
        r"HELPLINE|"
        r"FOR\s+FEEDBACK|"
        r"FOR\s+COMPLAINTS?|"
        r"FOR\s+FEEDBACK\s*/?\s*COMPLAINTS?)"
        r"\s*[:\-]?\s*"
        r"(.{0,220})",
    ]

    for pattern in labeled_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        value = re.split(
            r"\b(?:MRP|NET\s*(?:QTY|QUANTITY|WEIGHT|CONTENT|CONTENTS)|"
            r"BEST\s+BEFORE|UBD|USE\s+BY|NUTRITIONAL\s+INFORMATION)\b",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        value = clean_value(value)

        if value:
            values.append(value)

    email_match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text,
    )

    if email_match:
        values.append(
            f"Email: {email_match.group(0)}"
        )

    phone_patterns = [
        r"(?:TOLL\s*FREE|PHONE|TEL|TELEPHONE|MOBILE|CONTACT)"
        r"\s*(?:NO\.?|NUMBER)?\s*[:\-]?\s*"
        r"((?:\+91[\s\-]?)?\d[\d\s\-]{8,14}\d)",

        r"\b1800[\s\-]?\d{3}[\s\-]?\d{4}\b",
    ]

    for pattern in phone_patterns:
        phone_match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if phone_match:
            phone = clean_value(
                phone_match.group(1)
                if phone_match.lastindex
                else phone_match.group(0)
            )

            if phone:
                values.append(
                    f"Phone: {phone}"
                )
                break

    if values:
        unique_values = list(
            dict.fromkeys(values)
        )

        return " | ".join(
            unique_values
        )

    return None



def extract_country_of_origin(
    text: str,
) -> str | None:
    patterns = [
        r"(?:COUNTRY\s+OF\s+ORIGIN|"
        r"COUNTRY\s+OF\s+ORIG[I1]N|"
        r"MADE\s+IN|"
        r"PRODUCT\s+OF|"
        r"ORIGIN\s*[:\-])"
        r"\s*[:\-]?\s*"
        r"([A-Za-z][A-Za-z\s]{1,40})",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        value = re.split(
            r"\b(?:INGREDIENTS|STORE|NUTRITION|"
            r"MRP|BATCH|NET|MANUFACTURED|"
            r"WEBSITE|FSSAI|LIC)\b",
            value,
            maxsplit=1,
            flags=re.IGNORECASE,
        )[0]

        value = clean_value(
            value
        )

        if value:
            return value

    return None



def extract_batch_number(
    text: str,
) -> str | None:
    patterns = [
        r"\bBATCH\b\s*(?:NO\.?|NUMBER|CODE)?\s*[:\-]?\s*"
        r"([A-Z0-9][A-Z0-9\-\/]{2,30})",

        r"\bLOT\b\s*(?:NO\.?|NUMBER|CODE)?\s*[:\-]?\s*"
        r"([A-Z0-9][A-Z0-9\-\/]{2,30})",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = clean_value(
            match.group(1)
        )

        if value and not re.fullmatch(
            r"\d{8,14}",
            value,
        ):
            return value

    return None



def _is_valid_ean13(value: str) -> bool:
    if not re.fullmatch(
        r"\d{13}",
        value,
    ):
        return False

    digits = [
        int(char)
        for char in value
    ]

    checksum = sum(
        digits[index]
        * (
            1
            if index % 2 == 0
            else 3
        )
        for index in range(12)
    )

    check_digit = (
        10 - (checksum % 10)
    ) % 10

    return check_digit == digits[12]


def _is_valid_upca(value: str) -> bool:
    if not re.fullmatch(
        r"\d{12}",
        value,
    ):
        return False

    digits = [
        int(char)
        for char in value
    ]

    checksum = sum(
        digits[index]
        * (
            3
            if index % 2 == 0
            else 1
        )
        for index in range(11)
    )

    check_digit = (
        10 - (checksum % 10)
    ) % 10

    return check_digit == digits[11]


def extract_barcode(
    text: str,
) -> str | None:
    explicit_patterns = [
        r"(?:BARCODE|BAR\s*CODE|EAN|UPC|GTIN)"
        r"\s*[:\-]?\s*(\d{8,14})",
    ]

    for pattern in explicit_patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = match.group(1)

            if _is_valid_ean13(value):
                return value

            if _is_valid_upca(value):
                return value

    matches = re.findall(
        r"\b\d{8,14}\b",
        text,
    )

    license_value = extract_fssai_license(
        text
    )

    if license_value:
        matches = [
            value
            for value in matches
            if value != license_value
        ]

    valid_barcodes = []

    for value in matches:
        if _is_valid_ean13(value):
            valid_barcodes.append(value)

        elif _is_valid_upca(value):
            valid_barcodes.append(value)

    if valid_barcodes:
        return valid_barcodes[0]

    return None


def extract_fssai_license(
    text: str,
) -> str | None:
    patterns = [
        r"(?:FSSAI|FSSAI\s+LIC(?:ENCE|ENSE)?|LIC(?:ENCE|ENSE)?\s*NO\.?)"
        r"\s*[:\-]?\s*(\d{10,14})",
        r"\b(\d{14})\b",
    ]

    for index, pattern in enumerate(
        patterns
    ):
        matches = re.finditer(
            pattern,
            text,
            re.IGNORECASE,
        )

        for match in matches:
            value = match.group(1)

            if index == 1:
                nearby = text[
                    max(
                        0,
                        match.start() - 50,
                    ):
                    min(
                        len(text),
                        match.end() + 50,
                    )
                ]

                if not re.search(
                    r"FSSAI|LIC",
                    nearby,
                    re.IGNORECASE,
                ):
                    continue

            return value

    return None


def extract_tax_status(
    text: str,
) -> str | None:
    patterns = [
        r"(INCL\.?\s+OF\s+ALL\s+TAXES)",
        r"(INCLUSIVE\s+OF\s+ALL\s+TAXES)",
        r"(INCLUSIVE\s+OF\s+TAXES)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            return clean_value(
                match.group(1)
            )

    return None


def extract_email(
    text: str,
) -> str | None:
    match = re.search(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        text,
    )

    if match:
        return match.group(0)

    return None


def extract_phone(
    text: str,
) -> str | None:
    patterns = [
        r"(?:PHONE|TEL|TELEPHONE|MOBILE|CONTACT)"
        r"\s*(?:NO\.?|NUMBER)?\s*[:\-]?\s*"
        r"((?:\+91[\s\-]?)?\d[\d\s\-]{8,14}\d)",

        r"\b(?:0\d{2,4}[\s\-]?)\d{6,8}\b",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            value = clean_value(
                match.group(1)
            )

            value = re.sub(
                r"\s+",
                " ",
                value,
            )

            return value

    return None



def extract_website(
    text: str,
) -> str | None:
    patterns = [
        r"\bhttps?://[^\s,;]+\b",
        r"\b(?:www\.)?[A-Za-z0-9][A-Za-z0-9.-]*\.(?:com|in|co\.in|org|net)\b",
    ]

    candidates = []

    for pattern in patterns:
        for match in re.finditer(
            pattern,
            text,
            re.IGNORECASE,
        ):
            value = match.group(0).strip(
                ".,;:)]}"
            )

            if "@" not in value:
                candidates.append(value)

    if not candidates:
        return None

    candidates.sort(
        key=lambda value: (
            value.lower().startswith("www."),
            len(value),
        ),
        reverse=True,
    )

    return candidates[0]


def extract_ingredients(
    text: str,
) -> str | None:
    patterns = [
        r"\bINGREDIENTS?\s*[:\-]?\s*(.+?)(?="
        r"\bNUTRITION"
        r"|\bSTORE\b"
        r"|\bPRODUCT\s+OF\b"
        r"|\bFOR\s+ALLERGENS\b"
        r"|$)",

        r"\bZUTATEN\s*[:\-]?\s*(.+?)(?="
        r"\bNUTRITION"
        r"|\bSTORE\b"
        r"|\bPRODUCT\s+OF\b"
        r"|$)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL,
        )

        if match:
            value = clean_value(
                match.group(1)
            )

            value = re.sub(
                r"\s+",
                " ",
                value,
            )

            if value:
                return value

    return None



def extract_allergen_information(
    text: str,
) -> str | None:
    patterns = [
        r"\bALLERGEN\s+INFORMATION\s*[:\-]?\s*"
        r"(.{1,220}?)(?="
        r"\bNUTRITIONAL\s+INFORMATION\b|"
        r"\bNUTRITION\b|"
        r"\bNET\s*(?:CONTENT|CONTENTS|QTY|QUANTITY|WEIGHT)\b|"
        r"\bMRP\b|$)",

        r"\bFOR\s+ALLERGENS?\s+SEE\s+INGREDIENTS?\s+IN\s+BOLD\b",

        r"\bMAY\s+CONTAIN\s*[:\-]?\s*(.+?)(?="
        r"\bZUTATEN\b|"
        r"\bSTORE\b|"
        r"\bPRODUCT\s+OF\b|"
        r"\bNUTRITION\b|$)",

        r"\bCONTAINS\s+"
        r"((?:MILK|MILK\.|WHEAT|GLUTEN|SOYA|SOY|"
        r"PEANUTS?|NUTS?|ALMOND|CASHEW|SESAME)"
        r"(?:\s*,?\s*(?:MILK|WHEAT|GLUTEN|SOYA|SOY|"
        r"PEANUTS?|NUTS?|ALMOND|CASHEW|SESAME))*)",
    ]

    values = []

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL,
        )

        if not match:
            continue

        if match.lastindex:
            value = clean_value(
                match.group(1)
            )

            if not re.search(
                r"\b(?:contains|may\s+contain)\b",
                value,
                re.IGNORECASE,
            ):
                value = (
                    "Contains "
                    + value
                )
        else:
            value = clean_value(
                match.group(0)
            )

        if value:
            values.append(value)

    if values:
        return " | ".join(
            dict.fromkeys(values)
        )

    return None



def extract_storage_instruction(
    text: str,
) -> str | None:
    patterns = [
        r"\bKEEP\s+REFRIGERATED\b"
        r".{0,180}",

        r"\bREFRIGERATED\s+AT\s+"
        r".{0,220}?(\.|"
        r"\bAND\s+CONSUME\b|$)",

        r"\bREFRIGERATE\s+"
        r".{0,220}?(\.|$)",

        r"\bSTORE\s+(?:IN|AT)\s+"
        r".{0,220}?("
        r"\bPRODUCT\s+OF\b|"
        r"\bINGREDIENTS\b|"
        r"\bNUTRITION\b|"
        r"\bCONSUME\b|$)",

        r"\bSTORE\s+IN\s+A\s+COOL\s+AND\s+DRY\s+PLACE\b",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE | re.DOTALL,
        )

        if not match:
            continue

        value = clean_value(
            match.group(0)
        )

        value = re.sub(
            r"\s+",
            " ",
            value,
        )

        value = re.sub(
            r"\s*(?:PRODUCT\s+OF|INGREDIENTS|NUTRITION)\b.*$",
            "",
            value,
            flags=re.IGNORECASE,
        )

        value = clean_value(
            value
        )

        if value and len(value) <= 260:
            return value

    return None


def extract_nutrition(
    text: str,
) -> dict[str, str]:
    nutrition: dict[str, str] = {}

    def extract_number_after_label(
        labels: list[str],
        max_chars: int = 80,
    ) -> str | None:
        label_pattern = "|".join(
            labels
        )

        pattern = (
            rf"(?:{label_pattern})"
            r"[^0-9]{0,"
            rf"{max_chars}"
            r"}"
            r"(\d+(?:\.\d+)?)"
        )

        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if not match:
            return None

        return match.group(1)

    field_specs = {
        "energy": (
            [
                r"ENERGY(?:\s*\(?(?:KCAL|KJ)\)?)?",
            ],
            "energy",
        ),
        "fat": (
            [
                r"TOTAL\s+FAT",
                r"\bFAT\b",
            ],
            "g",
        ),
        "saturated_fat": (
            [
                r"SATURATED\s+FAT",
                r"OF\s+WHICH\s+SATURATES",
            ],
            "g",
        ),
        "trans_fat": (
            [
                r"TRANS\s+FAT",
            ],
            "g",
        ),
        "cholesterol": (
            [
                r"CHOLESTEROL",
            ],
            "mg",
        ),
        "carbohydrate": (
            [
                r"CARBOHYDRATE",
            ],
            "g",
        ),
        "sugars": (
            [
                r"TOTAL\s+SUGARS",
                r"\bSUGARS\b",
            ],
            "g",
        ),
        "added_sugars": (
            [
                r"ADDED\s+SUGARS",
            ],
            "g",
        ),
        "protein": (
            [
                r"PROTEIN",
            ],
            "g",
        ),
        "sodium": (
            [
                r"SODIUM",
            ],
            "mg",
        ),
        "calcium": (
            [
                r"CALCIUM",
            ],
            "mg",
        ),
        "vitamin_b12": (
            [
                r"VITAMIN\s+B12",
                r"VITAMIN\s+B\s*12",
            ],
            "ug",
        ),
        "salt": (
            [
                r"\bSALT\b",
            ],
            "g",
        ),
    }

    for field, (
        labels,
        unit,
    ) in field_specs.items():
        number = extract_number_after_label(
            labels
        )

        if number is None:
            continue

        if field == "energy":
            energy_match = re.search(
                r"(?:ENERGY)[^0-9]{0,80}"
                r"(\d+(?:\.\d+)?)"
                r"\s*(KCAL|KJ)?",
                text,
                re.IGNORECASE,
            )

            if energy_match:
                energy_unit = (
                    energy_match.group(2)
                    or "kcal"
                )

                nutrition[field] = (
                    f"{energy_match.group(1)} "
                    f"{energy_unit.lower()}"
                )
        else:
            nutrition[field] = (
                f"{number} {unit}"
            )

    return nutrition



def extract_brand_name(
    detections: list[dict],
    product_name: str | None,
) -> str | None:
    texts = []

    for detection in detections:
        value = clean_value(
            str(
                detection.get(
                    "text",
                    "",
                )
            )
        )

        if value:
            texts.append(value)

    if not texts:
        return None

    known_brands = [
        "Amul",
        "Parle",
        "Oreo",
        "GoodFood",
        "NutriBite",
    ]

    for brand in known_brands:
        for value in texts:
            if re.search(
                rf"\b{re.escape(brand)}\b",
                value,
                re.IGNORECASE,
            ):
                return brand

    product_upper = (
        product_name.upper()
        if product_name
        else ""
    )

    candidates = []

    for index, value in enumerate(
        texts
    ):
        upper = value.upper()

        if product_name and upper in {
            product_upper,
        }:
            continue

        if re.search(
            r"\d|MRP|NET|MILKY|MILK|"
            r"PASTEURISED|PASTEURIZED|"
            r"NUTRITION|INFORMATION|"
            r"ALLERGEN|MANUFACTURED|"
            r"MARKETED|FSSAI|LIC",
            upper,
        ):
            continue

        if not re.fullmatch(
            r"[A-Z][A-Z0-9&' .\-]{1,40}",
            value,
            re.IGNORECASE,
        ):
            continue

        word_count = len(
            re.findall(
                r"[A-Za-z]+",
                value,
            )
        )

        score = 0.0

        if word_count <= 3:
            score += 0.3

        if index < 12:
            score += 0.25

        if value.isupper():
            score += 0.15

        score += min(
            0.3,
            float(
                detection.get(
                    "confidence",
                    0,
                )
            ),
        )

        candidates.append(
            {
                "value": value,
                "score": score,
            }
        )

    if not candidates:
        return None

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[0]["value"]



def extract_usp(
    text: str,
) -> str | None:
    patterns = [
        r"\bUSP\s*[:\-]?\s*"
        r"(₹?\s*\d+(?:\.\d+)?\s*/\s*(?:ML|L|G|KG))",

        r"\bUNIT\s+SELLING\s+PRICE\s*[:\-]?\s*"
        r"(₹?\s*\d+(?:\.\d+)?\s*/\s*(?:ML|L|G|KG))",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE,
        )

        if match:
            return clean_value(
                match.group(1)
            )

    return None


def extract_product_name(
    detections: list[dict],
) -> str | None:
    candidates = []

    ignored_words = {
        "MRP",
        "NET",
        "QTY",
        "QUANTITY",
        "WEIGHT",
        "CONTENTS",
        "MANUFACTURED",
        "MANUFACTURER",
        "MFD",
        "MFD.",
        "MANOFACTURED",
        "PACKED",
        "PACKER",
        "PKD",
        "IMPORTED",
        "IMPORTER",
        "BEST",
        "BEFORE",
        "USE",
        "BY",
        "CUSTOMER",
        "CONSUMER",
        "CARE",
        "HELPLINE",
        "FEEDBACK",
        "COMPLAINT",
        "CONTACT",
        "MADE",
        "IN",
        "CONTAINS",
        "CONTAIN",
        "TRACES",
        "INGREDIENTS",
        "NUTRITIONAL",
        "INFORMATION",
        "ENERGY",
        "PROTEIN",
        "CARBOHYDRATE",
        "SUGAR",
        "FAT",
        "TRANS",
        "SATURATED",
        "STORE",
        "COOL",
        "DRY",
        "PLACE",
        "BISCUITS",
        "BATCH",
        "LIC",
        "LICENSE",
        "FSSAI",
    }

    for index, detection in enumerate(
        detections
    ):
        text = clean_value(
            str(
                detection.get(
                    "text",
                    "",
                )
            )
        )

        if not text:
            continue

        confidence = float(
            detection.get(
                "confidence",
                0,
            )
        )

        upper_text = text.upper()

        if re.fullmatch(
            r"[\d\s.,:/\-₹]+",
            text,
        ):
            continue

        if len(text) < 3:
            continue

        words = {
            word.upper()
            for word in re.findall(
                r"[A-Za-z]+",
                text,
            )
        }

        if words and words.issubset(
            ignored_words
        ):
            continue

        if re.search(
            r"\b(?:MRP|NET\s*(?:QTY|QUANTITY|WEIGHT)|"
            r"MFD|PKD|PACKED|MANUFACTURED|"
            r"IMPORTED|BEST\s+BEFORE|"
            r"CONTAINS|INGREDIENTS|"
            r"NUTRITIONAL|BATCH|"
            r"LIC\.?\s*NO|FSSAI)\b",
            upper_text,
        ):
            continue

        if re.search(
            r"\d+\s*(?:KG|KGS|G|GM|GMS|MG|ML|L|LTR|PCS?)\b",
            text,
            re.IGNORECASE,
        ):
            continue

        if "@" in text:
            continue

        if re.search(
            r"\b\d{10,14}\b",
            text,
        ):
            continue

        if len(text) > 120:
            continue

        score = confidence

        if re.search(
            r"[A-Za-z]",
            text,
        ):
            score += 0.10

        word_count = len(
            re.findall(
                r"[A-Za-z]+",
                text,
            )
        )

        if word_count >= 2:
            score += 0.08

        product_keywords = [
            "OREO",
            "REO",
            "DARK",
            "FANTASY",
            "CHOCO",
            "CHOCOLATE",
            "BISCUIT",
            "COOKIE",
            "CREAM",
            "FILLED",
            "PARLE",
            "PARLE-G",
        ]

        if any(
            keyword in upper_text
            for keyword in product_keywords
        ):
            score += 0.25

        candidates.append(
            {
                "text": text,
                "confidence": confidence,
                "score": score,
                "index": index,
            }
        )

    if not candidates:
        return None

    for candidate in candidates:
        upper_text = candidate[
            "text"
        ].upper()

        if "PARLE-G" in upper_text:
            return "Parle-G"

        if "PARLE G" in upper_text:
            return "Parle-G"

        if "OREO" in upper_text:
            return "Oreo"

    for first_index, first in enumerate(
        candidates
    ):
        for second in candidates[
            first_index + 1:
        ]:
            index_difference = abs(
                first["index"]
                - second["index"]
            )

            if index_difference > 3:
                continue

            combined = (
                f"{first['text']} "
                f"{second['text']}"
            )

            combined_upper = combined.upper()

            if (
                "DARK" in combined_upper
                and "FANTASY" in combined_upper
            ):
                for third in candidates:
                    if abs(
                        third["index"]
                        - second["index"]
                    ) <= 3:
                        third_upper = (
                            third["text"].upper()
                        )

                        if (
                            "CHOCO" in third_upper
                            or "COOKIE" in third_upper
                            or "FILLED" in third_upper
                        ):
                            combined = (
                                f"{combined} "
                                f"{third['text']}"
                            )
                            break

                return clean_value(
                    combined
                )

    candidates.sort(
        key=lambda item: (
            item["score"],
            item["confidence"],
            len(item["text"]),
        ),
        reverse=True,
    )

    return candidates[0]["text"]



def extract_fields(
    detections: list[dict],
) -> dict[str, Any]:
    raw_text = get_search_text(
        detections
    )

    normalized_text = normalize_text(
        raw_text
    )

    net_quantity = extract_net_quantity(
        normalized_text
    )

    nutrition = extract_nutrition(
        normalized_text
    )

    product_name = extract_product_name(
        detections
    )

    extracted = {
        "product_name": product_name,

        "brand_name": extract_brand_name(
            detections,
            product_name,
        ),

        "mrp": extract_mrp(
            normalized_text,
            detections,
        ),

        "net_quantity_value": (
            net_quantity["value"]
            if net_quantity
            else None
        ),

        "net_quantity_unit": (
            net_quantity["unit"]
            if net_quantity
            else None
        ),

        "manufacturer": extract_manufacturer(
            normalized_text
        ),

        "packer": extract_packer(
            normalized_text
        ),

        "importer": extract_importer(
            normalized_text
        ),

        "manufacturing_date": extract_date(
            normalized_text,
            [
                "MANUFACTURED",
                "MANUFACTURING DATE",
                "MFG",
                "MFD",
                "MFG DATE",
            ],
        ),

        "packing_date": extract_date(
            normalized_text,
            [
                "PACKED",
                "PACKING DATE",
                "PKD",
                "PACK DATE",
            ],
        ),

        "best_before": extract_best_before(
            normalized_text
        ),

        "use_by": extract_use_by(
            normalized_text
        ),

        "consumer_care_details": (
            extract_consumer_care(
                normalized_text
            )
        ),

        "country_of_origin": (
            extract_country_of_origin(
                normalized_text
            )
        ),

        "batch_number": extract_batch_number(
            normalized_text
        ),

        "barcode": extract_barcode(
            normalized_text
        ),

        "fssai_license": extract_fssai_license(
            normalized_text
        ),

        "tax_status": extract_tax_status(
            normalized_text
        ),

        "email": extract_email(
            normalized_text
        ),

        "phone": extract_phone(
            normalized_text
        ),

        "website": extract_website(
            normalized_text
        ),

        "usp": extract_usp(
            normalized_text
        ),

        "ingredients": extract_ingredients(
            normalized_text
        ),

        "allergen_information": (
            extract_allergen_information(
                normalized_text
            )
        ),

        "storage_instruction": (
            extract_storage_instruction(
                normalized_text
            )
        ),

        "nutrition": nutrition or None,
    }

    return extracted


