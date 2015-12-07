# taDateRangePicker
Pure AngularJS DateRangePicker (no jQuery required)

Sample usage

        <ta-date-range-picker ng-model="dateRange" ranges="customRanges" 
                callback="dateRangeChanged()"></ta-date-range-picker>

Add required files

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
        <link href="dist/ta-date-range-picker.css" rel="stylesheet" />
    
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular.min.js"></script>
        <script type="text/javascript" src="libs/bindonce.min.js"></script>
        <script type="text/javascript" src="libs/moment.min.js"></script>
        <script type="text/javascript" src="libs/moment-range.min.js"></script>
        <script src="dist/ta-date-range-picker.js"></script>

        angular.module("app", ['tawani.utils'])
            .controller("MainCtrl", ['$scope', function ($scope) {

                // specify default date range in controller
                $scope.dateRange = moment().range("2015-12-05", "2016-01-25");

                //Select range options
                $scope.customRanges = [
                    {
                        label: "This week",
                        range: moment().range(
                            moment().startOf("week").startOf("day"),
                            moment().endOf("week").startOf("day")
                        )
                    },
                    {
                        label: "Last month",
                        range: moment().range(
                            moment().add(-1, "month").startOf("month").startOf("day"),
                            moment().add(-1, "month").endOf("month").startOf("day")
                        )
                    },
                    {
                        label: "This month",
                        range: moment().range(
                            moment().startOf("month").startOf("day"),
                            moment().endOf("month").startOf("day")
                        )
                    }
                ];

                $scope.mycallback = "None";
                $scope.dateRangeChanged = function() {
                    $scope.mycallback = " from " + $scope.dateRange.start.format("LL") + 
                        " to " + $scope.dateRange.end.format("LL");
                }

            }]);

#Also Requires
MomentJS - https://github.com/moment/moment/

Moment-Range - https://github.com/gf3/moment-range

BindOnce - https://github.com/Pasvaz/bindonce
