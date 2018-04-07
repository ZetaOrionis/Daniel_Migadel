$(document).ready(function(){

  $(function() {

   $.datepicker.setDefaults($.datepicker.regional['fr']);

   $(".datepicker").datepicker({

      dateFormat: 'dd-mm-yy'

   });

  });

  $("#submit").button({
    icon: {
      primary : 'ui-icon-circle-triangle-e'
    }
  });

  $("#submit").click(function (e){
    e.preventDefault();
    requeteFlickRImages();
  });

  $("#tabs-2").hide();

  $("#button-tabs-1").click(function() {
    $("#tabs-2").hide();
    $('#tabs-1').show();
  });

  $("#button-tabs-2").click(function() {
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

var dataSet = [];
var nbrImageDone = 0;
var nbrImage = 0;
var datatable = false;
var table = null;
$(document).ajaxComplete(function(){
  if(nbrImageDone == nbrImage) {
    if(datatable == false) {
      datatable = true;
      table = $('#table').dataTable({
        "data" : dataSet,
        "searching" : false
      });
    } else {
      table.fnClearTable();
      if(typeof dataSet !== "undifined" && dataSet.length != 0) {
        table.fnAddData(dataSet);
      }
    }
  } else {
    nbrImageDone++;
  }
});

function requeteFlickRImages() {
    $('#tabs-1').empty();
    $('#tbody').empty();
    dataSet = [];
    var flickRApiUrl = "https://api.flickr.com/services/rest/";
    var get = $.getJSON(flickRApiUrl,{
      method : "flickr.photos.search",
      nojsoncallback : "1",
      api_key : "753d73b4c8cd87f833d3dc98665e9dce",
      tags : $('#ville').val(),
      format : "json",
      min_taken_date : $('.datepicker').val(),
      per_page : $('#nbphotos').val()
    }).done(function(dataInfo) {
      if(dataInfo.photos.photo.length == 0) {
        $("#datavide").dialog("open");
      } else {
        nbrImage = dataInfo.photos.photo.length;
        var getInfo = $.each(dataInfo.photos.photo, function(index, photo) {

          var farm = photo.farm;
          var server = photo.server;
          var id = photo.id;
          var secret = photo.secret;
          var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+".jpg";

          $('#tabs-1').append("<tr><td><img src="+url+" data-id="+id+" /><tr><td>");

          var flickRApiUrl2 = "https://api.flickr.com/services/rest/";

          var ajaxgetInfo = $.getJSON(flickRApiUrl2,{
            method : "flickr.photos.getInfo",
            nojsoncallback : "1",
            api_key : "753d73b4c8cd87f833d3dc98665e9dce",
            photo_id : id,
            format : "json",
          }).done(function(dataInfo2) {

              /*var date = new Date(data.photo.dates.taken);*/
              dataSet.push([
                "<img src=\""+url+"\"/>",
                dataInfo2.photo.title._content,
                dataInfo2.photo.owner.username,
                dataInfo2.photo.dates.taken
              ]);


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
