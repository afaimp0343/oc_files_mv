$(document).ready(function() {
	if(/(public)\.php/i.exec(window.location.href)!=null) return; // escape when the requested file is public.php
	var img = OC.imagePath('core','actions/play');
	if (typeof FileActions !== 'undefined') {
		FileActions.register('all', t('files_mv','Move'),OC.PERMISSION_READ, function(){return OC.imagePath('core','actions/play')}, function(file) {
			if (($('#mvDrop').length > 0)) {
				$('#mvDrop').detach();
			}
			else{
				mvCreateUI(true,file,false);
			}
		});
	};
	function button(file,copy){
			}
	$('<a class="move" id="move" href="#"><img class="svg" src="'+img+'" alt="'+t('files_mv','Move')+'">'+t('files_mv','Move')+'</a>').appendTo('#headerName .selectedActions');

	$('#move').click(function(event){
		if($('#mvDrop').length>0){
			$('#mvDrop').detach();
			return;
		}
		//event.preventDefault();
		event.stopPropagation();
		var files = getSelectedFiles('name');
		var file='';
		for( var i=0;i<files.length;++i){
			file += files[i]+';';
		}
		mvCreateUI(false,file,false);
	});
	$(this).click(function(event){
		if( (!($(event.target).hasClass('ui-corner-all')) && $(event.target).parents().index($('.ui-menu'))==-1) &&
			(!($(event.target).hasClass('mvUI')) && $(event.target).parents().index($('#mvDrop'))==-1)){
			$('#mvDrop').detach();
		}
	});
	$('#mvForm').live('submit',function(){
		var dest = $('#dirList').val();
		var file = $('#dirFile').val();
		var dir  = $('#dir').val();
		var copy = $('#dirCopy').attr('checked')=='checked';
		$.ajax({
			type: 'POST',
			url: OC.linkTo('files_mv','ajax/move.php'),
			cache: false,
			data: {dir: dir, src: file, dest: dest, copy: copy},
			success: function(data){
				if(data.status=="success"){
				$.each(data.name,function(index,value){
					FileList.remove(value);
					procesSelection();
					});
				}
			}
		});
		$('#dirList').autocomplete("close");
		$('#mvDrop').detach();
		return false;
	});
});
/**
 * draw the move-dialog; if file is readonly, activate copy
 *
 * @local - true for single file, false for global use
 * @file - filename in the local directory
 */
function mvCreateUI(local,file){
	file2 = file.split(';');
	var permUpdate = true;
	for(var i=0;i<file2.length;++i){
		if(file2[i]== "") continue;
		var tmp = $('tr[data-file="'+file2[i]+'"]');
		if((OC.PERMISSION_UPDATE&parseInt(tmp.attr('data-permissions')))==0){ // keine updaterechte
			permUpdate=false;
			break;
		}
	}
	var copy = ($('#dir').val().substring(0,7)=="/Shared"); //set copy as default when current directory is located in shared dir 
	var html = '<div id="mvDrop" class="mvUI">';
	html += '<form action="#" id="mvForm"><input type="checkbox" id="dirCopy"';
	if(!permUpdate || copy) html += ' checked';
	if(!permUpdate) html += ' disabled';
	html += '></input><label for="dirCopy">'+t('files_mv','Copy')+'</label><br>';

	html += '<input id="dirList" data-placeholder="'+t('files_mv','Destination directory')+'"><br>';
	html += '<input type="hidden" id="dirFile" value="'+file+'" />';
	html += '<input type="submit" id="dirListSend" value="'+t('files_mv','Move')+'" />';
	html += '<strong id="mvWarning"></strong></form>';
	html += '</div>';
	if(local){
		$(html).appendTo($('tr').filterAttr('data-file',file).find('td.filename'));
	}
	else{
		$(html).addClass('mv').appendTo('#headerName .selectedActions');
	}
	$('#dirList').focus();
	$('#dirList').autocomplete({
		minLength:0,
		source: function(request, response) {
			$.getJSON(
				OC.linkTo('files_mv', 'ajax/autocompletedir.php'),
				{
					file: $('#dir').val()+'/'+file,
					StartDir: $('#dirList').val()
				},
				function(dir){ response(dir); }
			);
		}, 
	});
	$('#dirList').autocomplete("search",""); // show the autocomplete-names
}
