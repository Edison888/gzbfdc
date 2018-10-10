toastr.options = {
    "closeButton": false,
    "debug": true,
    "positionClass": 'toast-bottom-full-width',
    "onclick": null,
    "showDuration": "1",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
var app = angular.module('binding', ["ngTable"]).config(function ($locationProvider) {
    $locationProvider.html5Mode(true);
});
app.controller('list_controller', function ($scope, $http, $document, $location, $log, $window, NgTableParams) {
    angular.element($document).ready(function () {
        if ($location.search().openid) {
            $http.post('/permission', {
                openid: $location.search().openid
            }).success(function (data) {
                if (!data.result) {
                    returnQrcode();
                }
            }).error(function () {
                returnQrcode();
            });
        } else {
            returnQrcode();
        }
    });

    function returnQrcode() {
        $window.location = '/qrcode';
    }

    $scope.searchMobile = '';
    $scope.searchMapping = function (mobile) {
        if (mobile == '') {
            $scope.getMappings();
        } else if (!(/^1[34578]\d{9}$/.test(mobile))) {
            toastr.error('手机号码有误，请重新输入！');
        } else {
            $http({
                method: 'get',
                url: requrl,
                //url: 'json/searchMappingByMobile',
                params: {
                    //phone: mobile,//chenhao
                    mobile: mobile,//jizhe
                    method: 'getUserMappingInfo'//jizhe
                    //method: 'getAllUserMappingInfo'//chenhao
                }
            }).success(function (response) {
                console.log(response);
                if (response.flag == 0) {
                    //$scope.users = response.data;//chenhao
                    $scope.users = [];//jizhe old fixed
                    $scope.users.push(response.data);//jizhe old fixed
                    var a = [];
                    a.push(response.data);
                    $scope.tableParams = new NgTableParams({}, {
                        counts: [],
                        paginationMaxBlocks: 6,
                        paginationMinBlocks: 2, dataset: a
                    });
                } else {
                    toastr.error(response.desc);
                }
            });
        }

    };
    $scope.filterUnBindNCUserN = function(){
            $http({
                method: 'get',
                url: requrl,
                //url: 'json/searchMappingByMobile',
                params: {
                    //phone: mobile,//chenhao
                    "canBeBind":"N",//jizhe
                    "method":"getUnBindUserMappingInfo"//jizhe
                    //method: 'getAllUserMappingInfo'//chenhao
                }
            }).success(function (response) {
                console.log(response);
                if (response.flag == 0) {
                    //$scope.users = response.data;//chenhao
                    $scope.users = [];//jizhe old fixed
                    $scope.users = response.data;//jizhe old fixed
                    // var b = [];
                    // b.push(response.data);
                    // console.log(b)
                    $scope.tableParams = new NgTableParams({}, {
                        counts: [],
                        paginationMaxBlocks: 6,
                        paginationMinBlocks: 2, dataset: response.data
                    });
                } else {
                    toastr.error(response.desc);
                }
            });//success
    }
    $scope.filterUnBindNCUserY = function(){
            $http({
                method: 'get',
                url: requrl,
                //url: 'json/searchMappingByMobile',
                params: {
                    //phone: mobile,//chenhao
                    "canBeBind":"Y",//jizhe
                    "method":"getUnBindUserMappingInfo"//jizhe
                    //method: 'getAllUserMappingInfo'//chenhao
                }
            }).success(function (response) {
                console.log(response);
                if (response.flag == 0) {
                    //$scope.users = response.data;//chenhao
                    $scope.users = [];//jizhe old fixed
                    $scope.users = response.data;//jizhe old fixed
                    // var c = [];
                    // c.push(response.data);
                    $scope.tableParams = new NgTableParams({}, {
                        counts: [],
                        paginationMaxBlocks: 6,
                        paginationMinBlocks: 2, dataset: response.data
                    });
                } else {
                    toastr.error(response.desc);
                }
            });
        }
    $scope.tableSelection = {};
    $scope.selectedRows = [];
    //$scope.selectedOpenIds = [];
    $scope.selectedOpenIdsStr = '';
    $scope.del = function () {
        //start from last index because starting from first index cause shifting
        //in the array because of array.splice()
        if ($scope.selectedRows.length > 0) {
            for (var i = 0; i < $scope.selectedRows.length; i++) {
                var selectIndex = $scope.selectedRows[i];
                $scope.selectedOpenIds.push($scope.users[selectIndex]['yzjid']);
            }
            if ($scope.selectedRows.length == 1) {
                $scope.selectedOpenIdsStr = $scope.selectedOpenIds[0];
            } else {
                $scope.selectedOpenIdsStr += $scope.selectedOpenIds[0];
                for (var i = 1; i < $scope.selectedRows.length; i++) {
                    var selectIndex = $scope.selectedRows[i];
                    $scope.selectedOpenIdsStr += ',' + $scope.users[selectIndex]['yzjid'];
                }
                console.log($scope.selectedOpenIdsStr);
            }
        }
        console.log($scope.selectedOpenIds);
        $http(
            {
                method: 'get',
                url: requrl,
                params: {
                    yzjid: $scope.selectedOpenIdsStr,
                    method: 'deleteUserMapping'
                }

            }
        ).success(function (response) {//todo 请求删除行数据
                console.log(response);
                if (response.flag == 0) {
                    toastr.success("已删除");
                } else {
                    toastr.error(response.desc);

                }

                $scope.selectedRows.reverse();
                console.log($scope.selectedRows);
                for (var i = 0; i < $scope.selectedRows.length; i++) {
                    var selectIndex = $scope.selectedRows[i];
                    //delete row from data
                    $scope.users.splice(selectIndex, 1);
                }
                $scope.tableParams = new NgTableParams({}, {
                    counts: [],
                    paginationMaxBlocks: 6,
                    paginationMinBlocks: 2, dataset: $scope.users
                });
            });
    };
    $scope.getSelectedRows = function () {
        //start from last index because starting from first index cause shifting
        //in the array because of array.splice()
        $scope.selectedRows = [];
        $scope.selectedOpenIds = [];
        $scope.selectedOpenIdsStr = '';
        for (var i = 0; i < $scope.users.length; i++) {// todo 125
            if ($scope.users[i]['checked']) {
                $scope.selectedRows.push(i);
            }
        }
    };
    $scope.getMappings = function () {
        document.getElementById('spinner').style.visibility = 'visible';
        $http({
            method: 'get',
            url: requrl,
            headers:{'Content-Type':'application/json'},
            params: {
                method: 'getAllUserMappingInfo'
            }
        }).success(function (response) {
         console.log(response)
            document.getElementById('spinner').style.visibility = 'hidden';
            $scope.users = [];//jizhe old fixed
            $scope.users = response.data;//jizhe old fixed
            $scope.tableParams = new NgTableParams({}, {
                paginationMaxBlocks: 6,
                paginationMinBlocks: 2, dataset: $scope.users
            });  
            //   $http({
            //   method:"get",
            //   url:"http://39.104.121.228:8888/",
            //   headers:{"Content-Type":"application/json;charset=utf-8"}
            //     } ).success(function(res1){
            //           $scope.myusers=JSON.parse(res1.data);
            //           console.log($scope.myusers)
            //         for(var i=0;i<$scope.users.length;i++){
            //             for(var j=0;j<$scope.myusers.length;j++){
            //                 if($scope.users[i].ncuser_code===$scope.myusers[j].user_code){
            //                     $scope.users[i].user_name=$scope.myusers[j].user_name;
            //                     $scope.users[i].userguid=$scope.myusers[j].userguid
                                
            //                 }
            //             }
            //         }  
            //         console.log($scope.users) ; 
                                  
            //     })
               
        });
      
    //     $http({
    //          method:"get",
    //         url: requrl,
    //         headers:{"Content-Type": "application/json"
    //                 },
    //         params:{
    //      yzjid:  "05dd3e1b-ce3b-11e6-b4ad-005056b8712a",
    //   yzjjob: "系统开发工程师",
    //   yzjname: "陈吉哲",
    //   yzjdept: "中国葛洲坝集团房地产开发有限公司本部\5G科技中心（科技信息部）",
    //   yzjmobile: "15010284969",
	//  myuserid: "582901bf-e984-e811-80bc-005056b85fee",
	//  myusercode: "chenjizhe",
	//  myusername:  "陈吉哲",
	//  mymobile:   "15010284969",
	//  mydept:  "科技信息部",
	//  myjob:  "系统开发工程师",
	//  myunit: "房地产总部",
	//  method: "bindMYUser"
    // }}).success(function(res2){
    //   console.log(res2)
    // })
         };
    $scope.getMappings();
    //分页相关↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    $scope.addYzj = function () {
        var temArray = [];
        temArray = $scope.users;
        var phoneValue = document.getElementById('yzj_phone').value;
        if (phoneValue == null || phoneValue == '' || phoneValue == undefined) {
            toastr.error('手机号不能为空');
        } else if (!(/^1[34578]\d{9}$/.test(phoneValue))) {
            toastr.error("手机号码有误，请重填");
        } else {
            document.getElementById('spinner').style.visibility = 'visible';
            $http({
                method: 'get',
                url: requrl,
                params: {
                    method: 'getYzjUserInfo',
                    mobile: phoneValue
                }
            }).success(function (response) {
                    document.getElementById('spinner').style.visibility = 'hidden';
                    if (response.flag == 0) {
                        var yzjUserObj = response.data;
                        var user = {
                            yzjid: yzjUserObj.yzjid,	//云之家账号ID
                            yzjmobile: yzjUserObj.yzjmobile,	//云之家人员手机号
                            yzjname: yzjUserObj.yzjname,   // 云之家人员名称
                            yzjdept: yzjUserObj.yzjdept,// 云之家人员部门
                            yzjjob: yzjUserObj.yzjjob//云之家人员职位
                        };
                        $http({
                            method: 'get',
                            url: requrl,
                            params: {
                                yzjid: yzjUserObj.yzjid,	//云之家账号ID
                                yzjmobile: yzjUserObj.yzjmobile,	//云之家人员手机号
                                yzjname: yzjUserObj.yzjname,   // 云之家人员名称
                                yzjdept: yzjUserObj.yzjdept,// 云之家人员部门
                                yzjjob: yzjUserObj.yzjjob,//云之家人员职位
                                method: 'createUserMapping'//方法名

                            }

                        }).success(function (response) {
                            console.log(response);
                            if (response.flag == 0) {
                                temArray.unshift(user);// todo 125
                                $scope.users = [];
                                $scope.users = temArray;
                                $scope.tableParams = new NgTableParams({}, {
                                    counts: [],
                                    paginationMaxBlocks: 6,
                                    paginationMinBlocks: 2, dataset: $scope.users
                                });
                            } else {
                                toastr.error(response.desc);
                            }
                        });
                    }
                    else {
                        toastr.error(response.error)
                    }
                }
            )
            ;
        }
    };
    $scope.bindNC = function () {
        console.log($scope.currentSelectedNcUser);
        document.getElementById('spinner').style.visibility = 'visible';
        $http(
            {
                method: 'get',
                url: requrl,
                params: {
                    ncjob: $scope.currentSelectedNcUser.ncjob,
                    ncmobile: $scope.currentSelectedNcUser.ncmobile,
                    ncunit: $scope.currentSelectedNcUser.ncunit,
                    ncdept: $scope.currentSelectedNcUser.ncdept,
                    ncusercode: $scope.currentSelectedNcUser.ncuser_code,
                    ncusername: $scope.currentSelectedNcUser.ncuser_name,
                    ncuserid: $scope.currentSelectedNcUser.ncuserid,
                    method: 'bindNCUser',
                    yzjid: $scope.currentUser.yzjid
                }
            }
        ).success(function (response) {
                document.getElementById('spinner').style.visibility = 'hidden';
                $scope.disableBind();
                console.log(response)
                if (response.flag == 0) {// todo 125
                    var currentIndex = '';
                    for (var i = 0; i < $scope.users.length; i++) {// todo 125
                        if ($scope.users[i]['yzjid'] == $scope.currentUser.yzjid) {
                            currentIndex = i;
                            $scope.users[currentIndex]['ncuser_code'] = $scope.currentSelectedNcUser.ncuser_code;
                            $scope.users[currentIndex]['ncuser_name'] = $scope.currentSelectedNcUser.ncuser_name;
                            $scope.users[currentIndex]['ncmobile'] = $scope.currentSelectedNcUser.ncmobile;
                            toastr.success("绑定成功");
                             //$scope.filterUnBindNCUserY();
                        }
                    }
                } else {
                    toastr.error(response.desc);
                }

            });//success

    };
    $scope.bindMY = function () {
        console.log($scope.currentSelectedMyUser);
        document.getElementById('spinner').style.visibility = 'visible';
        $http(
            {
                method: 'get',
                url: requrl,
                params: {
                    // myjob: $scope.currentSelectedMyUser.job,
                    mymobile: $scope.currentSelectedMyUser.mobile,
                    myunit: $scope.currentSelectedMyUser.unit,
                    mydept: $scope.currentSelectedMyUser.dept,
                    myusercode: $scope.currentSelectedMyUser.user_code,
                    myusername: $scope.currentSelectedMyUser.user_name,
                    myuserid: $scope.currentSelectedMyUser.userguid,
                    method: 'bindMYUser',
                    yzjid: $scope.currentUser.yzjid,
                    yzjmobile: $scope.currentUser.yzjmobile,
                    yzjname: $scope.currentUser.yzjname
                }
            }
        ).success(function (response) {
                document.getElementById('spinner').style.visibility = 'hidden';
                console.log(response)
                $scope.disableBind();
                console.log(response)
                if (response.flag == 0) {// todo 125
                    var currentIndex = '';
                    for (var i = 0; i < $scope.users.length; i++) {// todo 125
                        console.log("进入")
                        if ($scope.users[i]['yzjid'] == $scope.currentUser.yzjid) {
                            currentIndex = i;
                            $scope.users[currentIndex]['myusercode'] = $scope.currentSelectedMyUser.user_code;
                            $scope.users[currentIndex]['myusername'] = $scope.currentSelectedMyUser.user_name;
                            // $scope.users[currentIndex]['mymobile'] = $scope.currentSelectedMyUser.mobile;
                            toastr.success("绑定成功");
                              //$scope.filterUnBindNCUserY();
                        }
                    }
                } else {
                    toastr.error(response.desc);
                }

            });  //success

    };
    $scope.disableBind = function () {
        $('#binding').attr("disabled", true);
        document.getElementById("binding").style.backgroundColor = "grey";
    };
    $scope.selectNcUser = function (ncUser) {
        $("#binding").removeAttr("disabled", false);
        document.getElementById("binding").style.backgroundColor = "#3cbaff";
        $scope.currentSelectedNcUser = ncUser;
    };
    $scope.selectMyUser = function (myUser) {
        $("#binding1").removeAttr("disabled", false);
        document.getElementById("binding1").style.backgroundColor = "#3cbaff";
        console.log(1);
        $scope.currentSelectedMyUser = myUser;
    };
    $scope.getYzjData = function (user) {
        console.log(user);
        $scope.ncusers = [];
        $scope.myusers=[];
        $scope.currentUser = {
            yzjid: user.yzjid,
            yzjmobile: user.yzjmobile,
            yzjname: user.yzjname,
            yzjdept: user.yzjdept,
            yzjjob: user.yzjjob
        };
        console.log($scope.currentUser)
        document.getElementById('spinner').style.visibility = 'visible';
        $http({
            method: 'get',
            url: requrl,
            params: {
                ncname: user.yzjname,
                ncmobile: user.yzjmobile,
                method: 'getNCUserInfo'
            }
        }).success(function (response) {
            document.getElementById('spinner').style.visibility = 'hidden';
            console.log(response);
            $scope.ncusers = [];
            if (response.flag == 0) {
                if (response.data.length > 0) {
                    $scope.ncusers = response.data;
                    console.log($scope.ncusers)
                }
            } else {
                toastr.error(response.desc);
            }
        });
        $http({
            method: 'get',
            url: requrl,
            // headers:{
            //     "Content-Type" : "application/json"
            // },
            params: {
                myname: user.yzjname,
                mymobile: user.yzjmobile,
                method: 'getMYUserInfo'
            }
        }).success(function (response) {
            document.getElementById('spinner').style.visibility = 'hidden';
            console.log(response);
            $scope.myusers = [];
            if (response.flag==0) {
                if (response.data.length > 0) {
                    $scope.myusers = response.data;
                    console.log($scope.myusers)
                }
            } else {
                console.log("myerror")
                toastr.error(response.desc);
            }
        });

    };

})
;