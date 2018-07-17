$(document).ready(function () {
    let rem = deFormt(document.querySelector('#rem').innerHTML), enviarPago = document.querySelector('#enviarPago');
    let loan = document.querySelector('#estado'), cancel = document.querySelector('#cancelar');
    let amort = document.querySelector('#amort'), fields = null, selectedRow = null, toggle = true;
    let imprimir = document.querySelector('#imprimir'), eliminar = document.querySelector('#eliminar');
    let contenidoTabla = document.querySelector('#contenidoTabla'), totales = [document.querySelector('#totalI'),document.querySelector('#totalP')];

    let paymentsTable = document.querySelector("#paymentsTable"), queryTable = $('#paymentsTable');
    tableRefresh();

    imprimir.addEventListener('click',function () {
        window.print();
    });

    amort.addEventListener('click',function () {
        let totalSpan = document.querySelector('#labelsIP');
        if (toggle){
            contenidoTabla.innerHTML = 'Amortización';
            totalSpan.style.display = 'block';
            if ($.fn.DataTable.isDataTable("#paymentsTable")) {
                queryTable.DataTable().destroy();
                queryTable.empty();
            }
            $.ajax({
                url: '/rutas/prestamos/amortizacion/'+loan.value,
                datatype: "json",
                success: function(response) {
                    totales[0].innerHTML = response.totals[0];
                    totales[1].innerHTML = response.totals[1];
                    let header = paymentsTable.createTHead();
                    let row = header.insertRow(0);
                    $.each(response.columns, function(i, val){
                        fields = row.insertCell(i);
                        fields.innerHTML = val;
                    });
                    let array = null;
                    loadTable(queryTable,array,response,0);
                },
                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
        }else{
            totalSpan.style.display = 'none';
            contenidoTabla.innerHTML = 'Pagos Realizados';
            tableRefresh();
        }
        toggle = !toggle;
    });

    eliminar.addEventListener('click',function () {
        if (confirm('Seguro que desea ELIMINAR este préstamo? Esta acción NO es reversible!')) {
            $.ajax({
                url: '/rutas/pagos/eliminarPrestamo/'+loan.value,
                type: 'delete',
                success: function (response) {
                    window.location.href = response.message;
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }
    });

    cancel.addEventListener('click',function () {
        if (confirm('Seguro que desea CANCELAR este préstamo?')) {
            $.ajax({
                url: '/rutas/pagos/cancelarPrestamo/'+loan.value,
                type: 'post',
                success: function (response) {
                    window.location.href = response.message;
                },
                error: function (error) {
                    console.log(error);
                }
            })
        }
    });

    queryTable.on('click', '.deletePayment', function () {
        let table = queryTable.DataTable(), obj = {};
        selectedRow = table.row($(this).closest('tr')).data();
        selectedRow.forEach(function (element, index) {
            obj[index] = element;
        });
        obj[10] = loan.value;
        obj[11] = document.querySelector('#modalType').innerHTML;
        obj[12] = nextDate.innerHTML;
        if (confirm('Seguro que desea eliminar este pago?')) {
            $.ajax({
                url: '/rutas/pagos/eliminarPago/'+selectedRow[0],
                data: obj,
                type: 'post',
                success: function () {
                    location.reload();
                },
                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
        }
    });

    queryTable.on('click', '.printPayment', function () {
        let table = queryTable.DataTable(), obj = {};
        selectedRow = table.row($(this).closest('tr')).data();
        selectedRow.forEach(function (element, index) {
            obj[index] = element;
        });
        $.ajax({
            url: '/rutas/pagos/recibos/'+loan.value+'/'+selectedRow[0],
            type: 'POST',
            data: obj,
            datatype: "json",
            success: function (response) {
                let width = $(document).width(), height = $(document).height();
                let newWindow = window.open("", "new window", "width="+width+", height="+height);
                //write the data to the document of the newWindow
                newWindow.document.write(response);
                setTimeout(function () {
                    newWindow.print()
                },1000)
            },
            error: function (err) {
                console.log(err);
            }
        });
    });

    function tableRefresh(){
        if ($.fn.DataTable.isDataTable("#paymentsTable")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }
        $.ajax({
            url: '/rutas/pagos/'+loan.value,
            datatype: "json",
            success: function(response) {
                if (response.data.length>0){
                    document.querySelector('#editRoute').style.display = 'none';
                }
                let header = paymentsTable.createTHead();
                let row = header.insertRow(0);
                $.each(response.columns, function(i, val){
                    fields = row.insertCell(i);
                    fields.innerHTML = val;
                });
                let array = [{
                    targets: [0],
                    visible: false,
                    searchable: false,
                },{
                    targets: -1,
                    data: null,
                    defaultContent: "<button class='printPayment'><i class='fa fa-print' style='color: green'></i></button>"
                }];
                loadTable(queryTable,array,response,1);
            },
            error: function(xhr) {
                alert('Usted no tiene permiso para interactuar con este contenido.');
            }
        });
    }
    function loadTable(queryTable,array,response,opt) {
        queryTable.DataTable({
            data: response.data,
            columnDefs: array,
            responsive: true,
            searching: false,
            lengthChange: false,
            paging: false,
            info: false,
            ordering: false,
            language: {
                sProcessing: "Procesando...",
                sLengthMenu: "Mostrar _MENU_ registros",
                sZeroRecords: "No se encontraron resultados",
                sEmptyTable: "Ningún dato disponible en esta tabla",
                sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
                sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
                sInfoPostFix: "",
                sSearch: "Buscar:",
                sUrl: "",
                sInfoThousands: ",",
                sLoadingRecords: "Cargando...",
                oPaginate: {
                    sFirst: "Primero",
                    sLast: "Último",
                    sNext: "Siguiente",
                    sPrevious: "Anterior"
                },
                oAria: {
                    sSortAscending: ": Activar para ordenar la columna de manera ascendente",
                    sSortDescending: ": Activar para ordenar la columna de manera descendente"
                }
            }
        });
        if (opt===1){
            let table = queryTable.DataTable();
            let lastRow = table.row(':last', {order: 'applied'}).data();
            lastRow[lastRow.length-1] = "<button class='deletePayment'><i class='fa fa-remove' style='color: red'></i></button>";
            table.row(':last', {order: 'applied'}).data(lastRow).draw();
        }
    }
});

//Vue Starts

moment.locale('es');

Vue.component('addPayments',{
    props: {
        real: {type:Number,default:null},
        cuota: {type:Number,default:null},
        interes: {type:Number,default:null},
        mora: {type:Number,default:null},
        descuento: {type:Number,default:null},
        prestamo: {type:Number,default:null},
        days: {type:Number,default:null}
    },
    data: function(){
        let date = new Date();
        return {
            fecha_ant: date.getFullYear()+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2),
            idp: this.prestamo,
            val_real: this.real,
            val_cuota: this.cuota,
            val_interes: this.interes,
            val_mora: this.mora,
            val_descuento: this.descuento,
            val_fecha: moment().format('LL'),
            val_days: this.days,
            formaPago: "option1",
            banco: null,
            numero: null,
            nota: null,
            otroMonto: null,
            total: null
        }
    },
    created: function(){
        this.totalPago();
    },
    beforeCreate: function () {
        if (this.formaPago !== 'option1'){
            let element = this.$refs;
            axios.get('/rutas/bancos/listado').then(result=>{
                result.data.data.forEach(function (row) {
                    let op = document.createElement('option');
                    op.setAttribute('value',row[0]);
                    op.innerHTML = row[0] + ' - ' + row[2];
                    element.bankSel.appendChild(op);
                });
            }).catch(error=>{
                console.log(error);
            });
        }
    },
    watch: {
        val_cuota: function () {
            this.totalPago()
        },
        otroMonto: function (cant) {
            this.val_cuota = cant;
        },
        val_mora: function () {
            this.totalPago()
        },
        val_descuento: function () {
            this.totalPago()
        }
    },
    template: '' +
    '<div id="paymentModal" class="modal fade" role="dialog" tabindex="-1">\n' +
    '    <div role="document" class="modal-dialog">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header bg-primary text-white">\n' +
    '                <div class="row">\n' +
    '                    <div class="col-sm-8">\n' +
    '                        <h5 class="modal-title">Agregar Pago</h5>\n' +
    '                    </div>\n' +
    '                    <div class="col-sm-4">\n' +
    '                        <button type="button" data-dismiss="modal" aria-label="Close" class="close">\n' +
    '                            <span aria-hidden="true">×</span>\n' +
    '                        </button>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <form class="form-horizontal">\n' +
    '                <div class="modal-body">\n' +
    '                    <div class="form-group">\n' +
    '                        <label class="control-label col-sm-5" for="fechaPago">Fecha de Pago: </label>\n' +
    '                        <div class="col-sm-5">\n' +
    '                            <span>' +
    '                               <input type="text" v-model="val_fecha" @change="changeField" @mouseover="changeType" @mouseleave="changeTypeBack" class="form-control" id="fechaPago" required/>'+
    '                            </span>\n' +
    '                        </div>\n' +
    '                    </div>\n' +
    '                    <hr>\n' +
    '                    <fieldset>\n' +
    '                        <legend>Monto a Pagar</legend>\n' +
    '                        <div class="row">\n' +
    '                            <div class="col-sm-6">\n' +
    '                                <div class="radioB">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" :value="cuota" v-model.number="val_cuota" id="cuotaPagar"> Pagar Cuota:\n' +
    '                                        <span>{{cuota | currency}}</span>\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                                <div class="radioB">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" :value="interes" v-model.number="val_cuota" id="interesPagar"> Solo Interés:\n' +
    '                                        <span>{{interes | currency}}</span>\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                                <div class="radioB">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" :value="otroMonto" v-model="val_cuota" id="otraCant"> Otra Cantidad:\n' +
    '                                        <input type="number" v-model.number="otroMonto" :disabled="val_cuota != otroMonto" step="any" min="0" class="form-control"  name="otraCant" placeholder="Otra Cantidad">\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                            <div class="col-sm-6">\n' +
    '                                <div>\n' +
    '                                    <label>Mora:\n' +
    '                                        <input type="number" v-model.number="val_mora" step="any" class="form-control" name="moras" id="moras" placeholder="Mora">\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                                <div>\n' +
    '                                    <label>Descuento:\n' +
    '                                        <input type="number" v-model.number="val_descuento" step="any" class="form-control" name="desc" id="desc" placeholder="Descuento">\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </div>\n' +
    '                        <div class="row" style="text-align: center">\n' +
    '                            <label class="control-label">Total a Pagar: {{total | currency}}</label>\n' +
    '                        </div>\n' +
    '                        <hr>\n' +
    '                        <div class="row">\n' +
    '                            <div class="form-group">\n' +
    '                                <div class="form-check-inline">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" v-model="formaPago" value="option1"> Efectivo\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                                <div class="form-check-inline">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" v-model="formaPago" value="option2"> Cheque\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                                <div class="form-check-inline">\n' +
    '                                    <label>\n' +
    '                                        <input type="radio" v-model="formaPago" value="option3"> Depósito o Transferencia\n' +
    '                                    </label>\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                            <div class="col-sm-12" v-show="formaPago !== \'option1\' ">' +
    '                                  <div id="infoCheque" class="form-group" >\n' +
    '                                    <select class="form-control" v-model="banco" ref="bankSel" style="margin-bottom: 10px;">\n' +
    '                                        <option selected disabled>Seleccione un Banco</option>' +
    '                                    </select>\n' +
    '                                    <input type="text" class="form-control" v-model="numero" name="numCheque" id="numCheque" placeholder="Número de Cheque o Depósito">\n' +
    '                                </div>\n' +
    '                            </div>\n' +
    '                        </div>\n' +
    '                    </fieldset>\n' +
    '                    <div class="form-group" style="margin: 5px;">\n' +
    '                        <div>\n' +
    '                            <label for="nota" class="control-label" style="color: #0e8f9f;">Nota:</label>\n' +
    '                            <textarea rows="1" class="form-control preTextArea" v-model="nota" id="nota"></textarea>\n' +
    '                        </div>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div class="modal-footer">\n' +
    '                    <button type="button" @click="enviarPago" class="btn btn-primary">Enviar</button>\n' +
    '                    <button type="button" data-dismiss="modal" class="btn btn-secondary">Cerrar</button>\n' +
    '                </div>\n' +
    '            </form>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>',
    methods: {
        totalPago: function () {
            this.total = 0;
            this.total += this.val_cuota > 0 ? this.val_cuota : 0;
            this.total += this.val_mora > 0 ? this.val_mora : 0;
            this.total -= this.val_descuento > 0 ? this.val_descuento : 0;
            // if (this.otroMonto>this.val_real || this.val_mora>this.val_real){
            //     this.total = 0;
            //     this.val_mora = '';
            //     this.otroMonto = '';
            // }else if(this.total<0) {
            //     this.total = 0;
            //     this.val_descuento = '';
            // }else{
            //     this.total = 0;
            //     this.total += this.val_cuota > 0 ? this.val_cuota : 0;
            //     this.total += this.val_mora > 0 ? this.val_mora : 0;
            //     this.total -= this.val_descuento > 0 ? this.val_descuento : 0;
            // }
        },
        changeType: function () {
            document.querySelector('#fechaPago').setAttribute('type','date');
            this.val_fecha = this.fecha_ant;
        },
        changeTypeBack: function () {
            document.querySelector('#fechaPago').setAttribute('type','text');
            let fecha = moment(this.fecha_ant);
            this.val_fecha = fecha.clone().format('LL');
        },
        changeField: function () {
            this.fecha_ant = this.val_fecha;
        },
        enviarPago: function () {
            let data = {
                prestamoId: this.idp,
                cuotas: this.val_cuota,
                interes: this.val_interes,
                mora: this.val_mora > 0 ? this.val_mora : 0,
                descuento: this.val_descuento > 0 ? this.val_descuento : 0,
                fechaPago: dateF(this.val_fecha),
                formaPago: pagoF(this.formaPago),
                dias: this.val_days,
                banco: this.banco,
                numero: this.numero,
                nota: this.nota,
                total: this.total
            };
            if (parseFloat(data.total)<=0){
                alert('El total pagado debe ser mayor que RD $0.00');
            }else{
                $.ajax({
                    url: '/rutas/pagos',
                    type: 'POST',
                    data: data,
                    datatype: "json",

                    success: function (response) {
                        if (response.message==='Pago realizado exitosamente.') {
                            location.reload();
                        }
                    },

                    error: function (error) {
                        console.log(error);
                    }

                });
            }
        }
    }
});
Vue.filter('moment', function (date, arg) {
    if (arg) {
        return moment(date).format(arg);
    } else {
        return moment(date).format('DD/MM/YYYY');
    }
});
Vue.filter('currency', function (value, currency, decimals) {
    let digitsRE = /(\d{3})(?=\d)/g;
    value = parseFloat(value);
    if (!isFinite(value) || (!value && value !== 0)) return '';
    currency = currency != null ? currency : '$';
    decimals = decimals != null ? decimals : 2;
    let stringified = Math.abs(value).toFixed(decimals);
    let _int = decimals
        ? stringified.slice(0, -1 - decimals)
        : stringified;
    let i = _int.length % 3;
    let head = i > 0
        ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
        : '';
    let _float = decimals
        ? stringified.slice(-1 - decimals)
        : '';
    let sign = value < 0 ? '-' : '';
    return sign + currency + head +
        _int.slice(i).replace(digitsRE, '$1,') +
        _float
});
let app = new Vue({
    el: '#app',
    data: {
        cuota: 0,
        interes: 0,
        periodos: 0,
        amort: 0,
        modal: 0
    }
});
function dateF(date) {
    let array = date.split(' '), result = null;
    let monthObj = {'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06','julio':'07','agosto':'08','septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'};
    Object.keys(monthObj).forEach(function(key) {
        if (key === array[2]){
            result = array[4]+'-'+monthObj[key]+'-'+('0'+array[0]).slice(-2);
        }
    });
    return result;
}
function pagoF(forma) {
    let methods = {'option1':'Efectivo','option2':'Cheque','option3':'Déposito o Transferencia'}, result = null;
    Object.keys(methods).forEach(function(key) {
        if (key === forma){
            result = methods[key];
        }
    });
    return result;
}
function deFormt(num){
    let val = '';
    num = num.split('');
    num.forEach(function (char) {
        if (char!=='$' && char!==','){
            val += char.toString();
        }
    });
    return parseFloat(val);
}
