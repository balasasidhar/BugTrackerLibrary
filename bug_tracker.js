/**
 * Created by SASi on 10-May-16.
 */
var bugTracker = {
    start: function (apiKey) {
        var self = this;
        self.apiKey = apiKey;
        if (!self.apiKey) return;
        self.getBrowser = function (regex) {
            var ua = navigator.userAgent, tem, M = ua.match(regex) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return {name: 'IE', version: (tem[1] || '')};
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\bOPR\/(\d+)/);
                if (tem != null) {
                    return {name: 'Opera', version: tem[1]};
                }
                tem = ua.match(/\bedge\/(\d+)/);
                if (tem != null) {
                    return {name: 'Edge', version: tem[1]};
                }
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) {
                M.splice(1, 1, tem[1]);
            }
            return {
                name: M[0],
                version: M[1]
            };
        };
        self.sendReport = function (report) {
            report.key = self.apiKey;
            var url = "http://bug-tracker.in/api/report"; // replace with url where you want to submit your error reports
            var client = new XMLHttpRequest();
            client.open("POST", url);
            client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            client.send('report=' + JSON.stringify(report));
        };
        window.onerror = function (message, source, lineno, colno, errorobj) {
            var regex = /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i;
            var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            var isFirefox = typeof InstallTrigger !== 'undefined';
            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            var isEdge = !isIE && !!window.StyleMedia;
            if (isEdge) regex = /(edge(?=\/))\/?\s*(\d+)/i;
            var isChrome = !!window.chrome && !!window.chrome.webstore;
            var isBlink = (isChrome || isOpera) && !!window.CSS;

            var browser = self.getBrowser(regex);
            var msg = message.split(':');
            var errorReport = {
                "error_type": msg[0],
                "error_message": msg[1],
                "url": source,
                "line_number": lineno,
                "column_number": colno,
                "stack_trace": errorobj.stack,
                "browser_details": browser.name + "(V-" + browser.version + ")",
                "operating_system": navigator.platform,
                "time_stamp": new Date().getTime()
            };
            self.sendReport(errorReport);
        }
    }
};

