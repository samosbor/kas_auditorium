var ROOM_SOURCE_ID = '';
var MENU_ZONE_ID = '';
var MENU_RETURN_PAGE = '';

var INFO_QUERY_MUSIC = 0;
var INFO_QUERY_JOINT = 0;
var INFO_QUERY_MENU = 0;

var MENU_ZONE_JNUM1 = new Array(137, 138, 139, 140, 141);
var MENU_ZONE_JNUM2 = new Array(166, 167, 168, 169, 170);
var MENU_ZONE_JNUM3 = new Array(90, 91, 92, 93, 94);

var QUERY_STAUTS = 0; // 0: idle  1:working  2:garbage
var PLAY_COUNT = -1;
var selectCache = {};

function ProgressShow(bar) {
    this.bar = bar;
}

function requestMusic() {
    $.ajax({
        url: 'cgi-bin/md.cgi',
        data: ({
            source: ROOM_SOURCE_ID,
            cur_time: new Date().getTime()
        }),
        success: function(data) {}
    });
}


function select( name ){
	var result;
	if ( selectCache[ name ] ) {
		return selectCache[ name ];
	}
	result = $(name);
	if(result.length > 0){
		return selectCache[ name ] = result;
	}

	return  selectCache[ name ] = $("iframe").contents().find(name);
}

function queryAllInfo() {
    QUERY_STAUTS = 1;
    $.ajax({
        url: 'cgi-bin/info.cgi',
        data: ({
            source: ROOM_SOURCE_ID,
            zone: MENU_ZONE_ID,
            music_info: INFO_QUERY_MUSIC,
            joint_info: INFO_QUERY_JOINT,
            menu_info: INFO_QUERY_MENU,
            cur_time: new Date().getTime()
        }),

        dataType: 'json',
        success: function(data) {
            if (data && data.music) {
                // music info
                item = data.music;
                node = select("#musicInfoAlbum");
                node.html(item.album + " (" + item.progress + ")");

                node = select("#musicInfoArtist");
                node.html(item.artist);

                node = select("#musicInfoSong");
                node.html(item.song);

                //node = $("#musicVol");
                vol = parseInt(item.vol);
                bar = new ProgressShow(document.getElementById("musicVol"));
                if (bar.bar != null) {
                    bar.bar.style.width = (79 - vol) * 100 / 79 + "%";
                    //   node.progressbar({value: (79 - vol) * 100 / 79 })
                }

                node = select("#musicProgressBar");
                duration = parseInt(item.duration);
                position = parseInt(item.position);
                status = parseInt(item.status);
                pcount = parseInt(item.pcount);
                if (pcount != PLAY_COUNT) {
                    node.progressbar({
                        value: position * 100 / duration
                    });
					if (status == 2 || status == 6 || status == 7 || status == 8) {
                        PLAY_COUNT = pcount;
                        node.stopTime();
                        node.everyTime(duration,
                        function() {
                            v = select("#musicProgressBar").progressbar("option", "value");
                            select("#musicProgressBar").progressbar("option", "value", v + 1);
                        });
                    } else if (status == 3) {
                        node.stopTime();
                    }
                }

            } // end of music
            // joint number
            if (data && data.joint) {
                item = data.joint;
                for (i = 0; i < item.items.length; i++) {
                    joint = item.items[i];

                    if (joint.type == "1") {
                        // digital joint number
                        node = select("#JND_" + joint.joinnum);
                        if (node.size() > 0) {
                            node.attr("class", "JND_" + joint.joinnum + "_" + joint.value);
                            if (MENU_ZONE_ID == 18) {
                                for (j = 0; j < MENU_ZONE_JNUM1.length; j++) {
                                    if (joint.joinnum == MENU_ZONE_JNUM1[j] && joint.value == 1) ROOM_SOURCE_ID = j + 1;
                                }
                            } else if (MENU_ZONE_ID == 19) {
                                for (j = 0; j < MENU_ZONE_JNUM2.length; j++) {
                                    if (joint.joinnum == MENU_ZONE_JNUM2[j] && joint.value == 1) ROOM_SOURCE_ID = j + 1;
                                }
                            } else if (MENU_ZONE_ID == 20) {
                                for (j = 0; j < MENU_ZONE_JNUM3.length; j++) {
                                    if (joint.joinnum == MENU_ZONE_JNUM3[j] && joint.value == 1) ROOM_SOURCE_ID = j + 1;
                                }
                            }
                        } else {
                            // About the Legend
                            node = select("#JNL_" + joint.joinnum + "_0");
							if (node.size() > 0) {
                                modeoff = select("#JNL_" + joint.joinnum + "_0");
								modeon = select("#JNL_" + joint.joinnum + "_1");
								if (joint.value == "1") {
                                    modeon.show();
                                    modeoff.hide();
                                } else {
                                    modeoff.show();
                                    modeon.hide();
                                }
                            } else {
                                // About the SubPage
                                modeon = select("#JNP_" + joint.joinnum);
                                if (modeon.size() <= 0) modeon = select("#JNS_" + joint.joinnum);
                                if (modeon.size() > 0) {
                                    if (joint.value == "1") modeon.show();
                                    else modeon.hide();
                                } else {
                                    if (pages[joint.joinnum] && joint.value == "1") {

                                        if (top.location.toString().indexOf(pages[joint.joinnum]) < 0) top.location = pages[joint.joinnum];
                                    }
                                }
                            }
                        }
                    } else if (joint.type == "2") {
                        // analog joint number
                        node = select("#JNAD_" + joint.joinnum);
                        if (node.size() > 0) {
                            // About the Decimal Gauge
                            node.html(joint.value);
                        } else {
                            node = select("#JNAH_" + joint.joinnum);
                            if (node.size() > 0) {
                                num = Number(joint.value);
                                // About the Hex Gauge
                                node.html(num.toString(16));
                            } else {
                                node = select("#BJNH_" + joint.joinnum);
                                if (node.size() > 0) {
                                    // About the Horzitiontal Gauge
                                    if (!bjnhs[joint.joinnum]) {
                                        var span = $('div', node);
                                        span.css('width', joint.value * node[0].offsetWidth / 65535);
                                    }
                                } else {
                                    node = select("#BJNV_" + joint.joinnum);
                                    if (node.size() > 0) {
                                        // About the Vertical Gauge
                                        if (!bjnvs[joint.joinnum]) {
                                            var span = $('div', node);
                                            span.css('height', node[0].offsetHeight - joint.value * node[0].offsetHeight / 65535);
                                        }
                                    } else {
                                        node = select("#SLH_" + joint.joinnum);
                                        if (node.size() > 0) {
                                            if (!slhs[joint.joinnum]) {
                                                var span = $('span', node);
                                                span.css('left', joint.value * node.width() / 65535 - (span.width() / 2 | 0) + 'px');
                                            }

                                        } else {
                                            node = select("#SLV_" + joint.joinnum);
                                            if (node.size() > 0) {
                                                if (!slvs[joint.joinnum]) {
                                                    var span = $('span', node);
                                                    span.css('top', (65535 - joint.value) * node.height() / 65535 - (span.height() / 2 | 0) + 'px');
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else if (joint.type == "3") {
                        if (!(noDtext.noDtext)) {
                            node = select("#DTEXT_" + joint.joinnum);
                            //node.html( joint.value );
                            node.html(joint.value.replace(/ /g, "&nbsp;").replace(/\n/g, "<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"));

                        }
                    }
                }
            } // end of joint      
            // menu
            if (data && data.menu) {
                if (QUERY_STAUTS != 2) {
                    result = data.menu;
                    blockSize = parseInt(result.blockSize);
                    menuSize = parseInt(result.menuSize);
                    if (menuSize != 65535 && blockSize == 0) {
                        // close the menu
                        requestMenu('0xFFFFFFFF', '0', '0', '0');
                    } else if (menuSize != 65535 && blockSize > 0) {
                        if (blockSize == result.items.length) {
                            // set title
                            select('#menuTitle').html(result.description);
                            select('#menuControlBack').attr("onclick", "requestMenu('" + result.id + "', '1', '0', '0')");
                            select('#menuControlPrevPage').attr("onclick", "requestMenu('" + result.id + "', '0', '3', '')");
                            select('#menuControlNextPage').attr("onclick", "requestMenu('" + result.id + "', '0', '2', '')");

                            for (i = 0; i < result.items.length; i++) {
                                item = result.items[i];
                                li = select('#menuItem' + i);
								li.attr("onclick", "selectMenu('" + result.id + "', '" + item.id + "', " + i + ", " + item.type + ")");
                                //li.attr("onclick", "alert('abcd')");
                                if (item.type == 8 || item.type == 9) {
                                    item.description = "<font color='red'>" + item.description + "</font>";
                                }
                                li.html(item.description);
                            }
                            menuBusy(false);
                        }
                    }

                    //alert(result.items.length);
                    // clear all remaining items
                    start = 0;
                    if (result.items) {
                        start = result.items.length;
                    }
                    if (start == 0) {
                        menuBusy(true);
                    }
                    for (i = start; i < 20; i++) {
                        li = select('#menuItem' + i);
						li.attr("onclick", "");
                        li.html("&nbsp;");
                    }
                }
            } // end of menu
        },

        complete: function(data) {
            // reset timer
            QUERY_STAUTS = 0;
            // setTimeout("queryAllInfo()", 500);      
        }

    });

}