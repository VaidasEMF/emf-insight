window.ImageAnalysis = {

    getBuildingBounds(floor) {

        const image =
            floor?.image;

        if (!image) {

            return {

                left: 0,

                top: 0,

                right: 0,

                bottom: 0

            };

        }

        return (

            floor?.imageAnalysis
                ?.buildingBounds ||

            {

                left: 0,

                top: 0,

                right: image.width,

                bottom: image.height

            }

        );

    }

};