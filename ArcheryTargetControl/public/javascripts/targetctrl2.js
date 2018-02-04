var targetControl = (function()
{

    var initialize = function(){
        i = 1;
        i=i*2;
        alert("initialize"+i.toString());
    }

    return {
        initialize: initialize
    }
})();