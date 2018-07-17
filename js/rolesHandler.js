$(document).ready(function () {
    let selectedRow = null, fields = null;
    let rolesTable = document.querySelector('#rolesTable'), roleName = document.querySelector('#roleName');
    let rolBtn = document.querySelector('#rolBtn'), rolBtnI = document.querySelector('#rolBtnI');
    let queryTable = $('#rolesTable'), privileges = $('input:checkbox'), rolesForm = document.querySelector('#rolesForm');
    tableRefresh();

    queryTable.on('click', '.tableBtnUpdate', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        rolesForm.setAttribute('action','/rutas/roles/actualizarRol/'+selectedRow[0]);
        privileges.prop('checked',false);
        $.get('/rutas/roles/actualizarRol/'+selectedRow[0], function (response) {
            roleName.setAttribute('value',response.roleName);
            response.data.forEach(function (value) {
               privileges.eq(value).prop('checked',true);
            });
        });
        rolBtn.setAttribute('title','Actualizar Rol');
        rolBtnI.setAttribute('class','fa fa-check');
    });

    queryTable.on('click', '.tableBtnDelete', function () {
        let table = queryTable.DataTable();
        selectedRow = table.row($(this).closest('tr')).data();
        if (confirm('Seguro que desea eliminar este rol?')) {
            $.ajax({
                "url": '/rutas/roles/eliminarRol/'+selectedRow[0],
                "type": 'delete',

                success: function () {
                    tableRefresh();
                },

                error: function(xhr) {
                    alert('Usted no tiene permiso para interactuar con este contenido.');
                }
            });
            rolesForm.setAttribute('action','/rutas/roles');
            roleName.setAttribute('value','');
            privileges.prop('checked',false);
            rolBtn.setAttribute('title','Crear Rol');
            rolBtnI.setAttribute('class','fa fa-plus');
        }
    });

    function tableRefresh(){
        if ($.fn.DataTable.isDataTable("#rolesTable")) {
            queryTable.DataTable().destroy();
            queryTable.empty();
        }

        $.ajax({
            url: '/rutas/roles/listado',
            datatype: "json",

            success: function(response) {
                let header = rolesTable.createTHead();
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
                    targets: -2,
                    data: null,
                    defaultContent: "<button class='tableBtnUpdate'>Modificar</button>"
                },{
                    targets: -1,
                    data: null,
                    defaultContent: "<button class='tableBtnDelete'>Eliminar</button>"
                }];

                queryTable.DataTable({
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

