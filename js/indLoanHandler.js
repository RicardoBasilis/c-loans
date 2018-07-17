$(document).ready(function () {
    let fields = null;
    let loansTable = document.querySelector("#loansTable"), queryTable = $('#loansTable');
    tableRefresh();

    queryTable.on("click", 'tbody tr', function(event){
        let row = queryTable.fnGetData(this);
        window.location.href = '/rutas/pagos/'+row[1]+'/'+row[0];
    });

    function tableRefresh(){
        let id = window.location.href.split('/');
        if ($.fn.DataTable.isDataTable("#loansTable")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }

        $.ajax({
            url: '/rutas/prestamos/listado/'+id[id.length-1],
            datatype: "json",

            success: function(response) {
                let header = loansTable.createTHead();
                let row = header.insertRow(0);

                $.each(response.columns, function(i, val){
                    fields = row.insertCell(i);
                    fields.innerHTML = val;
                });

                let array = [{
                    targets: [0,1],
                    visible: false,
                    searchable: false,
                }];

                queryTable.dataTable({
                    data: response.data,
                    columnDefs: array,
                    responsive: true,
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
                alert('Usted no tiene permiso para interactuar con este contenido.');
            }
        });
    }

});
