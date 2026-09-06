// =====================
// 🔥 NOTIFICATION BUBBLE
// =====================

window.NotificationBubble = {

    current: null,

    timer: null,

    // =====================
    // 🔥 SHOW
    // =====================

    show({

        text,

        screenPoint = null,

        worldPoint = null,

        type = "info",

        duration = 2000

    }) {

        this.current = {

            text,

            screenPoint,

            worldPoint,

            type

        };

        requestRender?.();

        clearTimeout(
            this.timer
        );

        this.timer = setTimeout(() => {

            this.current = null;

            requestRender?.();

        }, duration);

    }

};