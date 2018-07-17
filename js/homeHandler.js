$(document).ready(function () {
    let fields = null, modo = 'Mes', mode = '/rutas/pagos/ingresos/month', graphBtn = document.querySelector('#graphBtn');
    let proximos = document.querySelector("#proximosPagos"), queryTable = $('#proximosPagos');
    tableRefresh();

    google.charts.load('current', {'packages':['bar']});
    google.charts.setOnLoadCallback(drawChart);

    graphBtn.addEventListener('click',function () {
        console.log(graphBtn);
        if (graphBtn.innerHTML==='Año'){
            mode = '/rutas/pagos/ingresos/year';
            graphBtn.innerHTML = 'Mes';
            modo = 'Año';
        }else{
            mode = '/rutas/pagos/ingresos/month';
            graphBtn.innerHTML = 'Año';
            modo = 'Mes';
        }
        drawChart();
    });

    function drawChart() {
        $.ajax({
            url: mode,
            datatype: 'get',

            success: function (response) {
                let array = [[modo, 'Interes', 'Capital', 'Pago Total','Capital Préstado']];
                response.data.forEach(function (row) {
                    array.push(row);
                });

                let  data = google.visualization.arrayToDataTable(array);

                let options = {
                    vAxis: {format:'currency'},
                    hAxis: {
                        textStyle : {
                            fontSize: 11 // or the number you want
                        }
                    },
                    chart: {
                        title: 'Estadísticas de Ingresos',
                        subtitle: 'Gráfica Comparativa Ingresos vs '+modo,
                    }
                };

                let chart = new google.charts.Bar(document.getElementById('chart_div'));
                chart.draw(data, google.charts.Bar.convertOptions(options));
            },

            error: function (xhr) {
                alert('El contenido no pudo ser mostrado. Contacte al administrador.');
            }
        });
    }

    function tableRefresh(){
        if ($.fn.DataTable.isDataTable("#proximosPagos")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }

        $.ajax({
            url: '/rutas/pagos/proximos',
            datatype: "json",

            success: function(response) {
                let header = proximos.createTHead();
                let row = header.insertRow(0);

                $.each(response.columns, function(i, val){
                    fields = row.insertCell(i);
                    fields.innerHTML = val;
                });

                let array = [{
                    targets: [1,2],
                    visible: false,
                    searchable: false,
                }];

                queryTable.DataTable({
                    data: response.data,
                    columnDefs: array,
                    responsive: true,
                    lengthChange: false,
                    paging: false,
                    searching: false,
                    info: false,
                    order: [[ 1, "desc" ]],
                    fnDrawCallback: function ( oSettings ) {
                        $(oSettings.nTHead).hide();
                    },
                    createdRow: function( row, data, dataIndex){
                        if(data[1]>=1 && data[1]<2){
                            $(row).addClass('yellowRow');
                        }else if(data[1]>=2){
                            $(row).addClass('redRow');
                        }else{

                        }
                    },
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
            },

            error: function(xhr) {
                alert('El contenido no pudo ser mostrado. Contacte al administrador.');
            }
        });
    }

});
