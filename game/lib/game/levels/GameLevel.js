ig.module( 'game.levels.GameLevel' )
.requires( 'impact.image' )
.defines(function(){
LevelGameLevel=/*JSON[*/{
  "entities":[],
  "layer":[
    {
      "name":"ground",
      "width":100,
      "height":100,
      "linkWithCollision":false,
      "visible":true,
      "tilesetName":"media/tiles/white.png",
      "repeat":true,
      "preRender":false,
      "distance":"1",
      "tilesize":32,
      "foreground":false,
      "data":[[1]]
    }
  ]
}/*]JSON*/;
LevelGameLevelResources=[new ig.Image('media/tiles/white.png')];
});
