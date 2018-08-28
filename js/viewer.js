$(document).ready(function(){
    let agentString = navigator.userAgent.toLowerCase();
    if(agentString.indexOf("edge")){
        $('.icon-toc').css('float', 'left');
        $('.icon-settings').css('float', 'left').css('margin', '8px 5px 0 5px');
        $('.icon-full-screen').css('float', 'left');
    }
});