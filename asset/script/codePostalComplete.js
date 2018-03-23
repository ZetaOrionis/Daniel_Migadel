$(document).ready(function(){
  $('form input[type="submit"]').click(function(e){
    e.preventDefault();
    $('#tabs-1').empty();
/*
    $.getJSON("https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",{
      tags : $('#ville').val(),
      format : "json",
    }).done(function(data) {
      console.log(data);
      $.each(data.items, function(index, item) {
        console.log(item);
        $("<img>").attr("src", item.media.m).appendTo("#tabs-1");
      })

    }).fail(function() {
      alert("Ajax call failed");
    });
*/
/*&api_key=753d73b4c8cd87f833d3dc98665e9dce&tags="+$('#ville').val()+"&format=json*/
    var flickRApiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&nojsoncallback=1";

    $.getJSON(flickRApiUrl,{
      api_key : "753d73b4c8cd87f833d3dc98665e9dce",
      tags : $('#ville').val(),
      format : "json",
    }).done(function(data) {
      console.log(data);
      $.each(data.photos.photo, function(index, photo) {
        console.log(data.photos.photo);
  /* <img src="https://farm{{Image.farm}}.staticflickr.com/{{Image.server}}/{{Image.id}}_{{Image.secret}}.jpg"/>*/
        var farm = data.photos.photo.farm;
        var server = data.photos.photo.server;
        var id = data.photos.photo.id;
        var secret = data.photos.photo.secret;
        //Voir problème d'affichage images
        var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+".jpg";
        /*$('#tabs_1').append('<img>'+url+'</img>')*/

        $("<img>").attr("src", url).appendTo("#tabs-1");
      })

    }).fail(function() {
      alert("Ajax call failed");
    });

  });

  $('#ville').autocomplete({ //$(this) = autocomplete
    source :
      function(request, response) {
        $.ajax({
          url : 'http://infoweb-ens/~jacquin-c/codePostal/codePostalComplete.php',
          dataType : 'json',
          type : "GET",
          data: {
            commune : $('#ville').val()
          }
        }).done(function(data) {
          var transData = data.map(function(item){
            return {
              label : item.Ville+"-"+item.CodePostal,
              value : item.CodePostal
            };
          })
          return response(transData);
        });
      },
      minLength:2
  });

  $(function() {
    $("#tabs").tabs();
  });

});
