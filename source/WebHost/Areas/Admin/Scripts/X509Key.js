﻿/*
 * Copyright (c) Dominick Baier, Brock Allen.  All rights reserved.
 * see license.txt
 */


$(function () {
    var svc = new authz.Service("admin/X509Keys");
    var certSvc = new authz.Service("admin/Certificates");

    function X509Key(list, data) {
        var vm = this;
        vm.isNew = ko.observable(!data);
        data = data || {
            id : 0,
            name: "",
            findType: 0,
            thumbprint:""
        };
        ko.mapping.fromJS(data, null, vm);

        authz.util.addRequired(this, "name", "Name");
        authz.util.addRequired(this, "thumbprint", "Certificate");
        authz.util.addAnyErrors(this);

        var certs = [];
        list.forEach(function (cert) {
            var name = cert.subject;
            if (cert.friendlyName) {
                name += " (" + cert.friendlyName + ")";
            }
            certs.push({ name: name, value: cert.thumbprint })
        });
        vm.certs = ko.observableArray(certs);

        vm.editDescription = ko.computed(function () {
            return vm.isNew() ? "New" : "Manage";
        });

        vm.certUrl = ko.computed(function () {
            return authz.baseUrl + "admin/Certificates/" + vm.id();
        });

        vm.save = function () {
            if (vm.isNew()) {
                svc.post(ko.mapping.toJS(vm)).then(function (data, status, xhr) {
                    window.location = window.location + '#' + data.id;
                    vm.isNew(false);
                    vm.id(data.id);
                });
            }
            else {
                svc.put(ko.mapping.toJS(vm), vm.id());
            }
        };
    }

    var certsReq = certSvc.get();

    if (window.location.hash) {
        var id = window.location.hash.substring(1);
        var svcRequest = svc.get(id);
        $.when(certsReq, svcRequest).done(function(c, k){
            var vm = new X509Key(c[0], k[0]);
            ko.applyBindings(vm);
        });
    }
    else {
        certsReq.done(function (list) {
            var vm = new X509Key(list);
            ko.applyBindings(vm);
        });
    }
});
