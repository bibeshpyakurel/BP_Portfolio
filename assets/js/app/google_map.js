(function () {
    'use strict';

    function initMap() {
        var mapElement = document.getElementById('map');
        if (!mapElement || !window.google || !window.google.maps) {
            return;
        }

        var center = new google.maps.LatLng(40.69847032728747, -73.9514422416687);

        var mapOptions = {
            zoom: 7,
            center: center,
            scrollwheel: false,
            styles: [{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]}]
        };

        var map = new google.maps.Map(mapElement, mapOptions);

        new google.maps.Marker({
            position: center,
            map: map,
            icon: 'assets/img/loc.png'
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
        return;
    }

    initMap();
}());