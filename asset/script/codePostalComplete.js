$(document).ready(function(){

  $("#tabs-2").hide();

  $("#button-tabs-1").click(function() {
    console.log("coucou");
    $("#tabs-2").hide();
    $('#tabs-1').show();
  });

  $("#button-tabs-2").click(function() {
    console.log("coucou2");
    $("#tabs-1").hide();
    $('#tabs-2').show();
  });

  $('#ville').autocomplete({
    source :
      function(request, response) {
        $.ajax({
          url : 'http://infoweb-ens/~jacquin-c/codePostal/commune.php',
          dataType : 'json',
          type : "GET",
          data: {
            commune : $('#ville').val()
          }
        }).done(function(data) {
          var transData = data.map(function(item){
            return {
              label : item.Ville,
              value : item.Ville
            };
          })
          return response(transData);
        });
      },
      minLength:2,
      select: function(event,ui) {
        $("#ville").val(ui.item.value);
        requeteFlickRImages();
      }
  });
/*
  $(function() {
    $("#tabs").tabs();
  });
*/
  $("#datavide").dialog({
    autoOpen : false,
    show : {
      effect : "fade",
      width: 600,
      height : 600,
      resizable: true,
    },
    hide : {
      effect : "blind",
    }
  });

  $("#infoImage").dialog({
    autoOpen : false,
    width: 600,
    height : 600,
    show : {
      effect : "fade",
    },
    hide : {
      effect : "blind",
    }
  });

});

function requeteFlickRImages() {
    $('#tabs-1').empty();
    $('#tabs-2').empty();

    var flickRApiUrl = "https://api.flickr.com/services/rest/";

    var get = $.getJSON(flickRApiUrl,{
      method : "flickr.photos.search",
      nojsoncallback : "1",
      api_key : "753d73b4c8cd87f833d3dc98665e9dce",
      tags : $('#ville').val(),
      format : "json",
      per_page : $('#nbphotos').val()
    }).done(function(data) {
      if(data.photos.photo.length == 0) {
        $("#datavide").dialog("open");
      } else {
        $('#tabs-2').append("<tr><th>Image</th><th>Titre</th><th>Username</th><th>Date</th></tr>");
        $.each(data.photos.photo, function(index, photo) {

          var farm = photo.farm;
          var server = photo.server;
          var id = photo.id;
          var secret = photo.secret;
          var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+".jpg";

          $('#tabs-1').append("<tr><td><img src="+url+" data-id="+id+" /><tr><td>");

          var flickRApiUrl2 = "https://api.flickr.com/services/rest/";

          var get = $.getJSON(flickRApiUrl2,{
            method : "flickr.photos.getInfo",
            nojsoncallback : "1",
            api_key : "753d73b4c8cd87f833d3dc98665e9dce",
            photo_id : id,
            format : "json",
          }).done(function(data) {

              var date = data.photo.dates.taken;
              var username = data.photo.owner.username;
              var title = data.photo.title._content;

              //CRÉER TABLEAU
              $('#tabs-2').append("<tr><td><img src="+url+"/></td><td>"+title+"</td><td>"+username+"</td><td>"+date+"</td></tr>");

          }).fail(function() {
            alert("Ajax call failed");
          });

        })
      }
    }).fail(function() {
      alert("Ajax call failed");
    });

    //On attends que tous les appels asynchrone soit chargés pour pouvoir ajouter un fonction
    //click sur les images recuperées.
    $.when(get).done(function() {
      $('img').click(function() {
        var id = $(this).attr("data-id");
        var url = $(this).attr("src");
        requeteFlickRImageInfos(id,url);
      });
    });

}

function requeteFlickRImageInfos(id,url) {
  var flickRApiUrl = "https://api.flickr.com/services/rest/";

  var get = $.getJSON(flickRApiUrl,{
    method : "flickr.photos.getInfo",
    nojsoncallback : "1",
    api_key : "753d73b4c8cd87f833d3dc98665e9dce",
    photo_id : id,
    format : "json",
  }).done(function(data) {

      var date = data.photo.dates.taken;
      var username = data.photo.owner.username;
      var title = data.photo.title._content;

      //CRÉER FENETRE MODAL
      $("#infoImage").dialog("open");
      $("#infoImage").dialog("option",{
        title : title,
      });
      $("#textInfoImage").empty();
      $("#textInfoImage").append("<img id="+id+" src="+url+" />");
      $("#textInfoImage").append("<p>"+username+"</p><p>"+date+"</p>");

  }).fail(function() {
    alert("Ajax call failed");
  });
}
