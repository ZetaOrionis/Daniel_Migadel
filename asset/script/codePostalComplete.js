$(document).ready(function(){
  $('#ville').autocomplete({
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

  $(function() {
    $("#tabs").tabs();
  });

  $("#datavide").dialog({
    autoOpen : false,
    show : {
      effect : "fade",
      width: 1000,
      height : 1000
    },
    hide : {
      effect : "blind",
    }
  });

  $("#infoImage").dialog({
    autoOpen : false,
    show : {
      effect : "fade",
      width: 1000,
      height : 1000
    },
    hide : {
      effect : "blind",
    }
  });

});

function requeteFlickRImages() {
    $('#tabs-1').empty();
    $('#tabs-2').empty();

    var flickRApiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&nojsoncallback=1";

    var get = $.getJSON(flickRApiUrl,{
      api_key : "753d73b4c8cd87f833d3dc98665e9dce",
      tags : $('#ville').val(),
      format : "json",
      per_page : $('#nbphotos').val()
    }).done(function(data) {
      console.log(data);
      if(data.photos.photo.length == 0) {
        $("#datavide").dialog("open");
      } else {
        $.each(data.photos.photo, function(index, photo) {

          var farm = photo.farm;
          var server = photo.server;
          var id = photo.id;
          var secret = photo.secret;
          var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+".jpg";

          $("<img>").attr("src", url).attr("data-id",id).appendTo("#tabs-1");
          $("<img>").attr("src", url).appendTo("#tabs-2");
        })
      }
    }).fail(function() {
      alert("Ajax call failed");
    });

    //On attends que tous les appels asynchrone soit chargés pour pouvoir ajouter un fonction
    //click sur les images recuperées.
    $.when(get).done(function() {
      console.log($("#tabs-1 img"));
      $('#tabs-1 img').click(function() {
        var id = $(this).attr("data-id");
        var url = $(this).attr("src");
        requeteFlickRImageInfos(id,url);
      });
    });

}

function requeteFlickRImageInfos(id,url) {
  var flickRApiUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&nojsoncallback=1";

  var get = $.getJSON(flickRApiUrl,{
    api_key : "753d73b4c8cd87f833d3dc98665e9dce",
    photo_id : id,
    format : "json",
  }).done(function(data) {

      var date = data.photo.dates.taken;
      var username = data.photo.owner.username;
      var title = data.photo.title._content;

      //CRÉER FENETRE MODAL
      $("#infoImage").dialog("open");
      $("#textInfoImage").text("Titre : "+title);
      $("#textInfoImage").prepend("<img id="+id+" src="+url+" />");

  }).fail(function() {
    alert("Ajax call failed");
  });
}
