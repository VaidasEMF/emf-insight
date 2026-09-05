"""
Premium PDF Font Manager

Shared font measurement helpers
for the PHI Design System.
"""

from PIL import ImageFont
from textwrap import wrap


class FontManager:

    # =====================================================
    # TEXT SIZE
    # =====================================================

    @staticmethod
    def text_size(
        draw,
        text,
        font,
    ):
        """
        Returns (width, height).
        """

        left, top, right, bottom = draw.textbbox(
            (0, 0),
            str(text),
            font=font,
        )

        return (
            right - left,
            bottom - top,
        )

    # =====================================================
    # FIT FONT
    # =====================================================

    @staticmethod
    def fit_font(
        draw,
        text,
        width,
        font,
        min_size=10,
    ):
        """
        Reduce font size until text fits width.
        """

        current = font

        while True:

            w, _ = FontManager.text_size(
                draw,
                text,
                current,
            )

            if w <= width:
                return current

            size = getattr(
                current,
                "size",
                None,
            )

            if size is None:
                return current

            if size <= min_size:
                return current

            try:

                current = ImageFont.truetype(
                    current.path,
                    size - 1,
                )

            except Exception:

                return current

    # =====================================================
    # ALIGNMENT
    # =====================================================

    @staticmethod
    def center_x(
        draw,
        text,
        font,
        x_center,
    ):
        """
        Calculate centered X coordinate.
        """

        width, _ = FontManager.text_size(
            draw,
            text,
            font,
        )

        return x_center - width / 2

    @staticmethod
    def right_x(
        draw,
        text,
        font,
        x_right,
    ):
        """
        Calculate right aligned X coordinate.
        """

        width, _ = FontManager.text_size(
            draw,
            text,
            font,
        )

        return x_right - width

    # =====================================================
    # WRAPPING
    # =====================================================

    @staticmethod
    def wrap_text(
        draw,
        text,
        font,
        width,
    ):
        """
        Wrap text to fit inside width.
        """

        if not text:
            return []

        avg_char_width = max(
            font.size * 0.55,
            1,
        )

        max_chars = max(
            8,
            int(width / avg_char_width),
        )

        lines = []

        paragraphs = str(text).split("\n")

        for paragraph in paragraphs:

            if not paragraph.strip():

                lines.append("")

                continue

            lines.extend(
                wrap(
                    paragraph,
                    width=max_chars,
                )
            )

        return lines

    # =====================================================
    # PARAGRAPH HEIGHT
    # =====================================================

    @staticmethod
    def paragraph_height(
        draw,
        text,
        font,
        width,
        line_spacing=8,
    ):
        """
        Calculate rendered paragraph height.
        """

        lines = FontManager.wrap_text(
            draw=draw,
            text=text,
            font=font,
            width=width,
        )

        if not lines:
            return 0

        return len(lines) * (
            font.size + line_spacing
        )