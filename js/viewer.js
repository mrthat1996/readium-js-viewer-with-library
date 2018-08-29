$(document).ready(function(){
    let agentString = navigator.userAgent.toLowerCase();
    if(agentString.indexOf("edge")){
        let style = document.createElement('style');
		style.innerHTML = `
		.icon-toc, .icon-full-screen{
			float: left;
		} 
		.icon-settings{
			float: left;
			margin: 8px 5px 0 5px;
		}`;
		$('head').append(style);
    }
});