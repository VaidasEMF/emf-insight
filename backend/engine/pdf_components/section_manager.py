# =====================
# SECTION MANAGER
# =====================


class SectionManager:

    def __init__(self):

        self.current = 0

    # =====================
    # NEXT
    # =====================

    def next(self):

        self.current += 1

        return self.current

    # =====================
    # RESET
    # =====================

    def reset(self):

        self.current = 0
