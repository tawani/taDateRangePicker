(function () {
    angular.module("tawani.utils", ['pasvaz.bindonce']);

    angular.module("tawani.utils").directive('taDateRangePicker',
        ["$compile", "$timeout", function ($compile, $timeout) {
            var CUSTOM = "CUSTOM";

            return {
                scope: {
                    model: "=ngModel",
                    ranges: "=",
                    callback: "&"
                },
                template: "<div class=\"selectbox\"><i class=\"fa fa-calendar\"></i> <span ng-show=\"model\">{{model.start.format(\"LL\")}} - {{model.end.format(\"LL\")}}</span> <span ng-hide=\"model\">Select date range</span> <b class=\"caret\"></b></div>",
                link: function (scope, element, attrs) {
                    //scope.name = 'Aaron';
                    scope.weekDays = moment.weekdaysMin();

                    //set default ranges
                    if (!(scope.ranges && scope.ranges.length))
                        scope.ranges = getDefaultRanges();

                    scope.show = function () {
                        //clear prevs
                        scope.currentSelection = null;
                        
                        //prepare
                        prepareMonths(scope);
                        scope.selection = scope.model;
                        prepareRanges(scope);
                        return scope.visible = true;
                    };
                    scope.hide = function ($event) {
                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }
                        scope.visible = false;
                        return scope.start = null;
                    };
                    scope.handlePickerClick = function ($event) {
                        return $event != null ? typeof $event.stopPropagation === "function" ? $event.stopPropagation() : void 0 : void 0;
                    };

                    scope.select = function (day, $event) {

                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }
                        if (day.disabled) {
                            return;
                        }

                        //both dates are already selected, reset dates
                        var current = scope.getCurrentSelection();

                        var date = day.date;
                        if ((current.start && current.end) || !current.start) {
                            current.start = moment(date);
                            current.end = null;
                            scope.inputDates[0] = current.start.format("YYYY-MM-DD");
                        } else if (current.start && !current.end) {
                            if (current.start.isAfter(date, 'day')) {
                                current.start = moment(date);
                                scope.inputDates[0] = current.start.format("YYYY-MM-DD");
                            }
                            else if (current.start.isBefore(date, 'day')) {
                                current.end = moment(date);
                                scope.inputDates[1] = current.end.format("YYYY-MM-DD");
                            }
                        }
                        scope.resetRangeClass();
                    };

                    scope.setRange = function (range, $event) {
                        if (!range)
                            return;
                        if (range == CUSTOM) {
                            scope.showCalendars = true;
                            return;
                        }
                        scope.showCalendars = false;
                        scope.currentSelection = range.clone();
                        scope.selection = scope.currentSelection.clone();
                        scope.ok($event);
                    };

                    scope.ok = function ($event) {
                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }
                        scope.model = scope.selection;
                        $timeout(function () {
                            if (scope.callback) {
                                return scope.callback();
                            }
                        });
                        return scope.hide();
                    };

                    scope.clear = function ($event) {
                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }
                        scope.selection = null;
                        scope.ok($event);
                    };

                    scope.applySelection = function ($event) {
                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }
                        scope.showCalendars = true;
                        scope.selection = moment.range(scope.currentSelection.start.clone(), scope.currentSelection.end.clone());
                        scope.ok($event);
                    }

                    scope.move = function (date, n, $event) {
                        if ($event != null) {
                            if (typeof $event.stopPropagation === "function") {
                                $event.stopPropagation();
                            }
                        }

                        var currentStart, currentEnd;

                        if (n < 0) {
                            
                            currentStart = date.clone().add(n, 'months');
                            currentEnd = currentStart.clone().add(1, 'months');
                            
                        } else {
                            currentEnd = date.clone().add(n, 'months');
                            currentStart = currentEnd.clone().add(-1, 'months');
                        }

                        scope.months[0] = createMonth(currentStart);
                        scope.months[1] = createMonth(currentEnd);
                    }

                    scope.getCurrentSelection = function() {
                        if (!scope.currentSelection && scope.selection)
                            scope.currentSelection = scope.selection.clone();
                        if (!scope.currentSelection)
                            scope.currentSelection = {};
                        return scope.currentSelection;
                    }

                    scope.getClassName = function (day) {

                        var current = scope.getCurrentSelection();

                        if (!day || day.number == false)
                            return "off";

                        if (current) {
                            if (current.start && current.start.isSame(day.date, 'day'))
                                return "active start-date";
                            if (current.end && current.end.isSame(day.date, 'day'))
                                return "active end-date";
                            if (current.start && current.end && current.start.isBefore(day.date, 'day') && current.end.isAfter(day.date, 'day'))
                                return "in-range";
                        }
                        return "available";
                    };

                    scope.resetRangeClass = function () {
                        var found = false;
                        var current = scope.getCurrentSelection();
                        for (var i = 0; i < scope.ranges.length; i++) {
                            var item = scope.ranges[i];
                            item.active = false;
                            if (item.range && item.range != CUSTOM && current.start && current.end) {
                                if (current.start.isSame(item.range.start, 'day') && current.end.isSame(item.range.end, 'day')) {
                                    item.active = true;
                                    found = true;
                                }
                            }
                        }
                        if (!found)
                            scope.ranges[scope.ranges.length - 1].active = true;
                    };

                    scope.updateStartOrEndDate = function (first, last) {
                        var current = scope.getCurrentSelection();

                        if (first) {
                            var start = moment(scope.inputDates[0]);
                            if (!start)
                                return;

                            current.start = start;
                            if (!current.end || current.end.isBefore(start, 'day')) {
                                current.end = start;
                                scope.inputDates[1] = current.end.format("YYYY-MM-DD");
                            }
                        } else if (last) {
                            var end = moment(scope.inputDates[1]);
                            if (!end)
                                return;

                            current.end = end;
                            if (!current.start || current.start.isAfter(end, 'day')) {
                                current.start = end;
                                scope.inputDates[0] = current.start.format("YYYY-MM-DD");
                            }
                        }
                        scope.resetRangeClass();
                    }

                    scope.moveToMonth = function (first, index) {
                        if (!first)
                            return;
                        
                        var start = moment(scope.inputDates[0]);
                        if (!start)
                            return;
                            
                        if (!start.isSame(scope.months[index].date, 'month')) {
                            //move to month
                            scope.months[0] = createMonth(start.clone());
                            scope.months[1] = createMonth(start.clone().add(1, 'months'));
                        }
                        
                    }
                    

                    /**************************************************************************************/
                    //load popup template
                    var el = $compile(angular.element(getPickDateTemplate()))(scope);
                    element.append(el);

                    element.bind("click", function (e) {
                        if (e != null) {
                            if (typeof e.stopPropagation === "function") {
                                e.stopPropagation();
                            }
                        }
                        return scope.$apply(function () {
                            if (scope.visible) {
                                return scope.hide();
                            } else {
                                return scope.show();
                            }
                        });
                    });
                    var documentClickFn = function (e) {
                        scope.$apply(function () {
                            return scope.hide();
                        });
                        return true;
                    };
                    angular.element(document).bind("click", documentClickFn);
                    scope.$on('$destroy', function () {
                        return angular.element(document).unbind('click', documentClickFn);
                    });
                }
            };

            function prepareRanges(scope) {
                if (scope.ranges[scope.ranges.length - 1].range != CUSTOM)
                    scope.ranges.push({ label: 'Custom Range', range: CUSTOM });

                scope.resetRangeClass();

                if (scope.ranges[scope.ranges.length - 1].active)
                    scope.showCalendars = true;
            };

            function prepareMonths(scope) {
                scope.months = [];
                var start = null;
                var end = null;
                if (scope.model) {
                    start = scope.model.start;
                    end = scope.model.end;
                }

                if (!start) start = moment();
                if (!end) end = moment();

                scope.months.push(createMonth(start.clone().startOf("month")));
                scope.months.push(createMonth(start.clone().startOf("month").add(1, "month")));

                scope.inputDates = [];
                scope.inputDates.push(start.format("YYYY-MM-DD"));
                scope.inputDates.push(end.format("YYYY-MM-DD"));
            }

            function createMonth(date) {
                var month = { name: date.format("MMM YYYY"), date: date, weeks: getWeeks(date) };
                return month;
            }

            function sameMonth(a, b, other) {
                if (a.month() !== b.month()) {
                    return other;
                }
                return a.date();
            }

            function getWeeks(m) {
                var lastOfMonth = m.clone().endOf('month'),
                    lastOfMonthDate = lastOfMonth.date(),
                    firstOfMonth = m.clone().startOf('month'),
                    currentWeek = firstOfMonth.clone().day(0),
                    startOfWeek,
                    endOfWeek;

                var thisMonth = m.month();
                var thisYear = m.year();

                var weeks = [];
                while (currentWeek < lastOfMonth) {
                    startOfWeek = sameMonth(currentWeek.clone().day(0), firstOfMonth, 1);
                    endOfWeek = sameMonth(currentWeek.clone().day(6), firstOfMonth, lastOfMonthDate);

                    var week = [];
                    for (var i = startOfWeek; i <= endOfWeek; i++)
                        week.push({ number: i, date: new Date(thisYear, thisMonth, i) });

                    var days = week.length;
                    if (days < 7) {
                        if (weeks.length == 0) {
                            while (days < 7) {
                                week.splice(0, 0, { number: false, disabled: true });
                                days += 1;
                            }
                        } else {
                            while (days < 7) {
                                week.push({ number: false, disabled:true });
                                days += 1;
                            }
                        }
                    }
                    weeks.push(week);

                    currentWeek.add(7, 'd');
                }

                return weeks;
            }

            function getDefaultRanges() {
                return [
                    {
                        label: "This week",
                        range: moment().range(moment().startOf("week").startOf("day"), moment().endOf("week").startOf("day"))
                    }, {
                        label: "Next week",
                        range: moment().range(moment().startOf("week").add(1, "week").startOf("day"), moment().add(1, "week").endOf("week").startOf("day"))
                    }, {
                        label: "This month",
                        range: moment().range(moment().startOf("month").startOf("day"), moment().endOf("month").startOf("day"))
                    }, {
                        label: "Next month",
                        range: moment().range(moment().startOf("month").add(1, "month").startOf("day"), moment().add(1, "month").endOf("month").startOf("day"))
                    }, {
                        label: "Year to date",
                        range: moment().range(moment().startOf("year").startOf("day"), moment().endOf("day"))
                    }
                ];
            }

                function getPickDateTemplate() {
                    return ''
                        + '<div ng-show="visible" ng-click="handlePickerClick($event)" class="ta-daterangepicker">'
                        + '<div bindonce ng-repeat="month in months" class="calendar" ng-show="showCalendars">'
                        + '<div class="input">'
                        + '<input class="input-mini active" type="text" ng-model="inputDates[$index]" ng-change="updateStartOrEndDate($first,$last)" ng-blur="moveToMonth($first,$index)"/>'
                        + '<i class="fa fa-calendar"></i>'
                        + '<a ng-show="$last && currentSelection && currentSelection.start && currentSelection.end" href="" ng-click="clear()"><i class="fa fa-remove"></i></a>'
                        + '</div>'
                        + '<div class="calendar-table">'
                        + '<table>'
                        + '<thead>'
                        + '<tr>'
                        + '<th class="available"><a ng-if="$first" ng-click="move(month.date, -1, $event)"><i class="fa fa-chevron-left"></i> </a></th>'
                        + '<th colspan="5"><div class="month-name" bo-text="month.name"></div></th>'
                        + '<th class="available"> <a ng-if="$last" ng-click="move(month.date, +1, $event)"><i class="fa fa-chevron-right"></i> </a> </th>'
                        + '</tr>'
                        + '<tr>'
                        + '<th bindonce ng-repeat="day in weekDays" class="weekday" bo-text="day"></th>'
                        + '</tr>'
                        + '</thead>'
                        + '<tbody>'
                        + '<tr bindonce ng-repeat="week in month.weeks">'
                        + '<td ng-repeat="day in week" ng-class="getClassName(day)">'
                        + '<div ng-if="day.number" bo-text="day.number" ng-click="select(day, $event)"></div>'
                        + '</td>'
                        + '</tr>'
                        + '</tbody>'
                        + '</table>'
                        + '</div>'
                        + '</div>'
                        + '<div class="ranges">'
                        + '<ul>'
                        + '<li bindonce ng-repeat="item in ranges" ng-class="{\'active\':item.active}"><div ng-click="setRange(item.range,$event)">{{item.label}}</div></li>'
                        + '</ul>'
                        + '<div>'
                        + '<button class="btn btn-sm btn-success" ng-click="applySelection()" ng-disabled="!showCalendars || !currentSelection || !currentSelection.start || !currentSelection.end">Apply</button> '
                        + '<button class="btn btn-sm btn-default" ng-click="hide()">Cancel</button>'
                        + '</div>'
                        + '</div>'
                        + '</div>';
                }
            }
    ]);
})();