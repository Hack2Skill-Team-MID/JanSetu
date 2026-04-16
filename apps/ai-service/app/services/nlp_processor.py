"""
NLP Processor Service
=====================
Processes survey uploads and extracts community needs using Gemini + fallback.
"""

from app.utils.gemini_client import gemini_client
from app.models.schemas import (
    ProcessSurveyRequest,
    ProcessSurveyResponse,
    ExtractedNeed,
    ExtractInsightsRequest,
    ExtractInsightsResponse,
)


class NlpProcessor:
    """Processes raw text/survey data into structured community needs."""

    async def process_survey(self, request: ProcessSurveyRequest) -> ProcessSurveyResponse:
        """
        Process a survey file and extract community needs.
        In production, this would:
        1. Download the file from file_url
        2. OCR if image/PDF
        3. Extract text
        4. Run NLP analysis

        For now, we simulate file reading and use Gemini/fallback for NLP.
        """
        # Simulate file content extraction based on file type
        # In production, this fetches the actual file and processes it
        simulated_text = await self._extract_text_from_file(
            request.file_url, request.file_type
        )

        # Use Gemini (or fallback) to extract needs
        result = await gemini_client.extract_needs_from_text(simulated_text)

        # Convert to response model
        extracted_needs = []
        for need_data in result.get("needs", []):
            extracted_needs.append(
                ExtractedNeed(
                    title=need_data.get("title", "Untitled Need"),
                    description=need_data.get("description", ""),
                    category=need_data.get("category", "other"),
                    urgency=need_data.get("urgency", "medium"),
                    location=need_data.get("location", "Unknown"),
                )
            )

        return ProcessSurveyResponse(
            extractedNeeds=extracted_needs,
            summary=result.get("summary", "Processing complete"),
            confidence=result.get("confidence", 0.5),
        )

    async def extract_insights(self, request: ExtractInsightsRequest) -> ExtractInsightsResponse:
        """Extract insights from raw text using Gemini/fallback."""
        result = await gemini_client.analyze_insights(request.text)

        return ExtractInsightsResponse(
            summary=result.get("summary", ""),
            categories=result.get("categories", []),
            urgency_score=result.get("urgency_score", 0.5),
            key_issues=result.get("key_issues", []),
        )

    async def _extract_text_from_file(self, file_url: str, file_type: str) -> str:
        """
        Extract text from a file. In production, this would:
        - Download the file from the URL
        - Use pytesseract for OCR on images
        - Use a PDF parser for PDFs
        - Read text files directly

        For now, we use the file_url as a text hint or return sample data.
        """
        if file_type == "text":
            # In production: fetch and read the text file
            # For demo: use the URL as context
            return f"Survey data from: {file_url}. Community members report issues with water supply and healthcare access in rural areas. Schools need better infrastructure. Children are missing classes due to lack of transport."

        elif file_type == "image":
            # In production: OCR with pytesseract
            return f"[OCR extracted from image: {file_url}] Village survey results: 45% households lack clean drinking water. 30% have no access to primary healthcare. Road conditions are poor, affecting school attendance. Urgent need for sanitation facilities."

        elif file_type == "pdf":
            # In production: PDF text extraction
            return f"[PDF extracted from: {file_url}] Annual community assessment report. Key findings: 1. Water scarcity affecting 500+ families. 2. Nearest hospital is 25km away. 3. Only 2 out of 5 schools have functioning toilets. 4. Unemployment rate at 40% among youth. 5. Food distribution program needed for elderly population."

        return f"Unprocessed file content from {file_url}"


# Singleton
nlp_processor = NlpProcessor()
