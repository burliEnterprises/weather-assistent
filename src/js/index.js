$(document).ready(function () {
    var colors = {          // useless?
        yellow: "#FFF59D"
        , cyan: "#80DEEA"
        , lightBlue: "#81D4FA"
        , blue: "#90CAF9"
        , red: "#E57373"
    };
    var cords = [{          // objekt des wetters/stadt, später befüllt über json call
        lon: 0
        , lat: 0
        , city: ""
        , climate: ""
        , temp: 0
  }];
    // Map A Number
    function map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    function getColor(c) {      // farbe wird je nach temperatur geholt
        if (c >= 24 && c <= 27) {
            return "rgb(66,244,244)";
        }
        if (c > 27) {
            var num = Math.floor(Math.max(0, Math.min(map_range(c, 27, 50, 0, 178), 178)));
            var val = 244 - num;
            console.log(` Yellow rgb(244,${val},66)`);
            return `rgb(244,${val},66)`;
        }
        else {
            var num = Math.floor(Math.max(0, Math.min(map_range(c, 0, 23, 0, 178), 178)));
            var val = 244 - (178 - num);
            console.log(` Cold rgb(66,${val},244)`);
            return `rgb(66,${val},244)`;
        }
    }
    //178 Diferrente from 244 and 66
    // 244 244 66 amarillo
    //244 66 66 rojo
    // 66 66 244 darkest blue
    // 66 244 244 lightest blue
    // 0 Coldest
    // 0 - 24 cold colors
    // 24 - 27 Light Blue always
    // 27 - 50 warm colors
    // 50 Hottest
    // 24 - 27 Optimal Temperature
    function getIconClass(climate) {        // je nach json return wird icon returned in die card
        if (climate == "Clouds") {
            return "wi-day-cloudy";
        }
        else if (climate == "Thunderstorm") {
            return "wi-day-sleet-storm";
        }
        else if (climate == "Drizzle") {
            return "wi-day-sleet";
        }
        else if (climate == "Rain") {
            return "wi-day-rain";
        }
        else if (climate == "Snow") {
            return "wi-snowflake-cold";
        }
        else if (climate == "Atmosphere") {
            return "wi-dust";
        }
        else if (climate == "Clear") {
            return "wi-day-sunny";
        }
        else if (climate == "Extreme") {
            return "wi-meteor";
        }
        return "wi-day-cloudy";
    }
    //var apiKey = "215dcc11553cf43b136662ee77ccdaf3"; daniels key
    var apiKey = "62b7126dccc0b9861f6b5487f62f2c71";
    // http://openweathermap.org/api, account m_ko, pwd: ow, standardmail

    function refreshAll() {     // befüllen aller karten bei refresh
        cords.forEach(function (obj, index) {
            var ele = $(`#${index}`);
            ele.find('.icon').removeClass().addClass(`icon wi ${getIconClass(obj.climate)}`);       // wettericon holen und schreiben
            ele.find('h3').html(`${obj.temp}º`);        // temperatur schreiben
            console.log(getColor(obj.climate));
            ele.css('background', getColor(obj.temp));          // farbe der karte holen und schreiben
        })
    }

    function reflect(promise) {     // gibt promise zurück ob erfolgreich/nicht erfolgreich; promise = objekt asynchron
        return promise.then(function (v) {
            return {
                v: v
                , status: "resolved"
            }
        }, function (e) {
            return {
                e: e
                , status: "rejected"
            }
        });
    }

    // call nach edit und eingabe der neuen stadt oder hinzufügen
    function reFetch() {
        var promises = [];
        var jsons = [];
        for (var i = 0; i < cords.length; i++) {        // für alle städte/karten
            console.log(cords[i].city);
            promises.push(fetch("http://api.openweathermap.org/data/2.5/weather?q=" + cords[i].city + '&APPID=' + apiKey).then(function (res) {
                return res.json();
            }));
        }
        Promise.all(promises.map(reflect)).then(function (results) {
            console.log("Promise All: ");
            results.forEach(function (obj, index) {
                cords[index].temp = Math.floor(obj.v.main.temp - 273.15);
                cords[index].climate = obj.v.weather[0].main;
            });
            console.log(cords);
            refreshAll();       // funktion zum einfügen der temp und icons für alle städte
        });
        //refresh();
    }
    
    // holt wetter für die startstadt
    fetch('http://ip-api.com/json').then(function (res) {       // json, daten des standorts
        res.json().then(function (json) {
            cords[0].lat = json.lat;
            cords[0].lon = json.lon;
            cords[0].city = json.city;
        }).then(function () {
            fetch('http://api.openweathermap.org/data/2.5/weather?lon=' + cords[0].lon + "&lat=" + cords[0].lat + '&APPID=' + apiKey).then(function (res) {
                res.json().then(function (res) {
                    cords[0].temp = Math.floor(res.main.temp - 273.15);
                    cords[0].climate = res.weather[0].main;
                    var html = $(`
    <i class="fa fa-times removeCardButton removeCollapsed"></i>
      <i class="icon wi ${getIconClass(cords[0].climate)}"></i>
      <h3 class='temp'>${cords[0].temp}º</h3>
      <p class="city">${cords[0].city}</p>
    `);
                    $('.first-card').html(html);        // schreibt karte
                    $('.first-card').css("background", getColor(cords[0].temp));        // schreibt bg der karte
                })
            }).catch(function (err) {
                console.log("Open Weather Coords: " + err);
            });
        })
    }).catch(function (err) {
        console.log("ip-api.com -" + err);
    })

    
    
     // format aendern:
    function transformTemp(curType, temp) {
        console.log(curType);
        if (curType == "C") {
            return Math.round(temp * 1.8 + 32);
        }
        else {
            return Math.round((temp - 32) / 1.8);
        }
    }
    
    $('#changeTemp').click(function () {
        var tempType = $(this).html();
        $('.temp').each(function () {
            var rawString = $(this).html();
            var temp = parseInt(rawString);
            var newTemp = transformTemp(tempType, temp);
            if (tempType == "C") {
                $(this).html(newTemp + "º");
            }
            else {
                $(this).html(newTemp + "º");
            }
        })
        if (tempType == "C") {
            $(this).html("F");
        }
        else {
            $(this).html("C");
        }
    });
    
    
    
    // neue karte hinzufuegen
    $('#addCard').click(function () {
        console.log('click');
        if (!$('#edit').hasClass('finishEdit')) {
            $('#edit').addClass('finishEdit');
        }
        cords.push({
            city: "City"
            , climate: "Clear"
            , temp: 0
        })
        // card = neue ungeschriebene karte mit platzhalter
        var card = $(`      
    <div class='card' editing=true id="${cords.length-1}">
    <i class="fa fa-times removeCardButton removeCollapsed"></i>
      <i class="icon wi wi-day-sunny"></i>
      <h3 class='temp'>0º</h3>
      <p class="city"><input class="cityname" type="text" id="cityInput" placeholder="City" /></p>
    
    </div>`);
        $('.cards').append(card);
        $(`#${cords.length-1}`).find('input').focus();
    });
    
    
    //  karte entfernen
    $('#removeCard').click(function () {
        console.log('click');
        $('#removeCard').toggleClass('removeInProgress');       // finishEdit klasse der action button wenn gerade bearbeitet
        $('.removeCardButton').toggleClass('removeCollapsed');       // finishEdit klasse der action button wenn gerade bearbeitet
       var attr = $(this).closest('.card').attr('editing');
    });
    
    $('.cards').on('click', 'i', function() { 
        console.log('click');
        var attr = $(this).closest('.card');
        $(attr).remove();

    });
    
    
    
    
    // karten ändern:
    var editTrigger = function () {
        $('#edit').toggleClass('finishEdit');       // finishEdit klasse der action button wenn gerade bearbeitet
        $('.city').each(function () {
            var attr = $(this).closest('.card').attr('editing');
            if (!$('#edit').hasClass('finishEdit')) {       // bearbeiten abgeschlossen
                if (typeof attr !== typeof undefined && attr !== false) {
                    var String = $.trim($(this).find('#cityInput').val()).length > 0 ? $(this).find('#cityInput').val() : $(this).find('#cityInput').attr('placeholder');
                    $(this).html(`${String} `);
                    $(this).closest('.card').removeAttr('editing');     // closest holt die nächstgelegene card (jquery), edit klasse der card wenn gerade bearbeitet
                    cords[$(this).closest('.card').attr('id')].city = String;
                    // Refresh Everything, unten
                }
            }
            else {      // bearbeiten begonnen
                $(this).html(`<input class="cityname" type="text" id="cityInput" placeholder="${$(this).html()}" />`);
                $(this).closest('.card').attr('editing', true);
            }
        })
        if (!$('#edit').hasClass('finishEdit')) {       // nach dem bearbeiten, holen wetter
            reFetch();
        }
    }
    
    // durch enter wird bearbeiten begonnen/abgeschlossen abgefangen
    $(document).on('keypress', 'input', function (e) {
        if (e.key == "Enter") {
            editTrigger();
        }
    });
    
    // aufruf der karten ändern funktion
    $("#editCards").click(editTrigger);
});