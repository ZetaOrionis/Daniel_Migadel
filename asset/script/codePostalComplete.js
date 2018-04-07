$(document).ready(function(){

  calendrier();
  onglets();
  icone();
  autocomplete();
  fenetreModal();

});

//Initialisation des variables 
var dataSet = [];
var nbrImageDone = 0;
var nbrImage = 0;
var datatable = false;
var table = null;
var flickRApiUrl = "https://api.flickr.com/services/rest/";

//Cette fonction permet de mettre le calendrier en français et de mettre la date 
//de la manière suivante : jour-mois-année 
function calendrier() {
  $.datepicker.setDefaults($.datepicker.regional['fr']);
  $(".datepicker").datepicker({
    dateFormat: 'dd-mm-yy'
  });
}

//Cette fonction permet de gérer les onglets de la page d'accueil via les 
//boutons 'Vue Photo' et 'Vue Tableau'
function onglets() {
  $("#tabs-2").hide();

  $("#button-tabs-1").click(function() {
    $("#tabs-2").hide();
    $('#tabs-1').show();
  });

  $("#button-tabs-2").click(function() {
    $("#tabs-1").hide();
    $('#tabs-2').show();
  });
}

//Cette fonction permet de donner un icône au bouton submit et lors d'un clique
//de lancer la méthode requeteFlickRImages() 
function icone() {
  $("#submit").button({
    icon: {
      primary : 'ui-icon-circle-triangle-e'
    }
  });

  $("#submit").click(function (e){
    e.preventDefault();
    requeteFlickRImages();
  });
}

//Cette fonction permet de faire l'autocomplétion lors de la saisi d'une ville 
//par l'utilisateur. Pour cela, nous utilisons le fichier php de Madame Jacquin
//pour la recherche d'une ville
function autocomplete() {
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
}


//Cette fonction permet de gérer l'apparition et la suppression
//de la fenêtre modale. Une première fenêtre modale permet 
//lorsque l'utilisateur clique sur une image dans la vue photo.
//L'autre permet d'afficher la vue erreur quand aucunes photos 
//ne correspond aux critères sélectionnés par l'utilisateur
function fenetreModal() {
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
}

//Cette fonction permet de gérer l'ajout et la suppression des données
//de la DataTable, en effet, les appels étant asynchrones avec AJAX. 
//Nous avons décidés de vérifier par nous même la fin de la méthode 
//AJAX 'getInfo' pour ensuite les ajouter dans la DataTable. 
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

//Cette fonction permet de récupèrer de puis FlickR les images correspondantes
//aux critères saisis par l'utilisateur.
//Dans un premier temps nous faisons une requête AJAX pour récupèrer l'ensemble
//des 'n' photos correspondantes aux choix de l'utilisateur.
//Une fois récupèrer, pour chaque nous faisons une seconde requête AJAX qui va
//nous permettre de récupèrer plus d'informations pour chacune d'entre-elles.
//Ainsi, nous remplisons la 'Vue Photo' et la 'Vue Tableau'
function requeteFlickRImages() {

  $('#tabs-1').empty();
  $('#tbody').empty();
  dataSet = [];

  //On recherche les images qui correspondent aux critères de l'utilisateur
  var get = $.getJSON(flickRApiUrl,{

    method : "flickr.photos.search",
    nojsoncallback : "1",
    api_key : "753d73b4c8cd87f833d3dc98665e9dce",
    tags : $('#ville').val(),
    format : "json",
    min_taken_date : $('.datepicker').val(),
    per_page : $('#nbphotos').val()

  }).done(function(dataInfo) {

    //On vérifie s'il existe des images correspondantes à la requètes.
    //Sinon on appel la fenêtre modale qui affiche 'aucune images trouvés'
    if(dataInfo.photos.photo.length == 0) {
      $("#datavide").dialog("open");
    } else {
      nbrImage = dataInfo.photos.photo.length;

      //Pour chaque images trouvés nous récupèrons leurs informations et les 
      //envoyons à la 'Vue Photo' et la 'Vue Tableau' 
      var getInfo = $.each(dataInfo.photos.photo, function(index, photo) {

        var farm = photo.farm;
        var server = photo.server;
        var id = photo.id;
        var secret = photo.secret;
        var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret+".jpg";

        $('#tabs-1').append("<tr><td><img src="+url+" data-id="+id+" /><tr><td>");

        var ajaxgetInfo = $.getJSON(flickRApiUrl,{

          method : "flickr.photos.getInfo",
          nojsoncallback : "1",
          api_key : "753d73b4c8cd87f833d3dc98665e9dce",
          photo_id : id,
          format : "json",

        }).done(function(dataInfo2) {

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
  //click sur les images recuperées pour la 'Vue Photo.
  $.when(get).done(function() {

    $('img').click(function() {
      var id = $(this).attr("data-id");
      var url = $(this).attr("src");
      requeteFlickRImageInfos(id,url);
    });
  });
}

//Cette fonction permet de récupèrer les informations correspondantes à l'image sélectionnée
//par l'utilisateur pour ensuite les ajouter à la fenetre modale qui va les afficher.
function requeteFlickRImageInfos(id,url) {

  var getInfo2 = $.getJSON(flickRApiUrl,{

    method : "flickr.photos.getInfo",
    nojsoncallback : "1",
    api_key : "753d73b4c8cd87f833d3dc98665e9dce",
    photo_id : id,
    format : "json",

  }).done(function(data) {

      var date = data.photo.dates.taken;
      var username = data.photo.owner.username;
      var title = data.photo.title._content;

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
