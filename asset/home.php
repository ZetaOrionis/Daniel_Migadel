<html>
  <head>
    <meta charset="utf-8">
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/themes/smoothness/jquery-ui.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
    <script type="text/javascript" src="script/codePostalComplete.js"></script>
  </head>
  <body>

    <form>
      <p>Entrer une commune <input id="ville" type="text" name="commune"> </p>
      <select name="nbImage">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="15">15</option>
        <option value="20">20</option>
        <option value="25">25</option>
      </select>
      <input type="submit" value="Rechercher">
    </form>

    <div id="tabs">
      <ul>
        <li><a href="#tabs-1">Vue Photo</a></li>
        <li><a href="#tabs-2">Vue Tableau</a></li>
      </ul>
      <div id="tabs-1">

        <!-- les photos s'affichent les unes en dessous des autres, sans infos
        verifier si l'array est vide dans le Jquery avent d'afficher, car si vide
        on créer une fenetre modale-->
        <!-- Quand on clique sur une image on affiche c'est infos dans une fenetre
        modale (UI Dialog)-->
      </div>
      <div id="tabs-2">
        
        <!-- les photos s'affichent dans une table avec dans chaque ligne, une vignette de la
        photo + dans les autres cellules de la table, les informations relatives à la photo-->
      </div>
    </div>

  </body>
</html>
