$(document).ready(function () {
    $.get('/user',function (response) {
        let user = document.querySelector("#username"), role = document.querySelector("#role"), pfp = document.querySelector("#pfp");
        user.innerHTML = response.object.username.capitalize();
        role.innerHTML = response.object.role;
        pfp.setAttribute('src','/images/'+response.object.pfp);
    });

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $.get('/rutas/alertas',function (response) {
        let alerts = response.data.length > 0 ? response.data.length : 0;
        let notNum = document.querySelector('#notNum'), notif = document.querySelector('#notificaciones');
        notNum.innerHTML = alerts;

        let li = document.createElement('li'), div = document.createElement('div'), h3 = document.createElement('h3');
        h3.style.fontSize = '14px';
        h3.innerHTML = 'Usted tiene '+alerts+' notificaciones.';
        div.setAttribute('class','notification_header');
        div.appendChild(h3);
        li.appendChild(div);
        notif.appendChild(li);

        response.data.forEach(function (row) {
            let li = document.createElement('li'), span = document.createElement('span'), msj = row.split('.');
            span.style.fontWeight = 'bold';
            span.innerHTML = msj[0];
            notif.appendChild(span);
            li.setAttribute('class','notifList');
            li.innerHTML = msj[1]+'<br>'+msj[2];
            notif.appendChild(li);
        });
    });

});