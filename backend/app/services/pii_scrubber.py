import re

EMAIL_REGEX = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

PHONE_REGEX = r"(\+?\d[\d\s\-()]{8,}\d)"

LINKEDIN_REGEX = r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s]+"

GITHUB_REGEX = r"(?:https?://)?(?:www\.)?github\.com/[^\s]+"


def extract_contact_info(
    text: str,
    pdf_links: list[str] | None = None
):
    pdf_links = pdf_links or []

    emails = re.findall(EMAIL_REGEX, text)
    phones = re.findall(PHONE_REGEX, text)

    linkedin_matches = re.findall(
        LINKEDIN_REGEX,
        text,
        flags=re.IGNORECASE
    )

    github_matches = re.findall(
        GITHUB_REGEX,
        text,
        flags=re.IGNORECASE
    )

    linkedin = (
        linkedin_matches[0]
        if linkedin_matches
        else None
    )

    github = (
        github_matches[0]
        if github_matches
        else None
    )

    for link in pdf_links:

        if (
            linkedin is None
            and "linkedin.com" in link.lower()
        ):
            linkedin = link

        if (
            github is None
            and "github.com" in link.lower()
        ):
            github = link

    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "linkedin": linkedin,
        "github": github
    }


def scrub_text(text: str) -> str:

    text = re.sub(
        EMAIL_REGEX,
        "[EMAIL]",
        text
    )

    text = re.sub(
        PHONE_REGEX,
        "[PHONE]",
        text
    )

    text = re.sub(
        LINKEDIN_REGEX,
        "[LINKEDIN]",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        GITHUB_REGEX,
        "[GITHUB]",
        text,
        flags=re.IGNORECASE
    )

    return text