var phantom = require('phantom');
phantom.create(function(ph) {
  return ph.createPage(function(page) {
    return page.open("http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/fichaDiputado?idDiputado=3&idLegislatura=10", function(status) {
      console.log("opened site? ", status);  
        //page.render('github.png');       
            page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js', function(err) {
                //jQuery Loaded.
                //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                setTimeout(function() {
                    return page.evaluate(function() {
                        
                        console.log($(".nombre_dip"))
                        var name = $(".nombre_dip").text;
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var nameArr = [],
                        dipArr = [];
                        $('.nombre_dip').each(function() {
                            nameArr.push($(this).html());
                        });
                        $('.dip_rojo').each(function() {
                            dipArr.push($(this).html());
                        });
 
                        return {
                            name: nameArr,
                            atts: dipArr
                        };
                        
                    }, function(result) {
                        console.log(result);
                        ph.exit();
                    });
                }, 5000);
 
            });       
        });
    });
});