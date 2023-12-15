function sendJoinNumber(jn) {
    callWithJoinNumber(1, jn, 2);
}

function sendJoinNumberDown(jn) {
    callWithJoinNumber(1, jn, 1);
}

function sendJoinNumberUp(jn) {
    callWithJoinNumber(1, jn, 0);
}

function sendJoinNumberAnalog(jn, val) {
    callWithJoinNumber(2, jn, val);
}

function sendJoinNumberSeral(jn, val) {
    callWithJoinNumber(3, jn, val);
}

function callWithJoinNumber(type, jn, value) {
    $.ajax({
        url: 'cgi-bin/jn.cgi',
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: ({
            t: type,
            n: jn,
            v: value,
            cur_time: new Date().getTime()
        }),
        success: function(data) {}
    });
}