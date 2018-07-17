$(document).ready(function () {
    let list = document.querySelector('#losClientes');

    axios.get('/rutas/clientes/listado').then(response=>{
        response.data.data.forEach(function (row) {
            let elem = document.createElement('option');
            elem.value = row[0]+" - "+row[2]+" "+row[3];
            list.appendChild(elem);
        });
    }).then(function () {
        if (loanData.length!==0){
            let array = Array.from(document.querySelector('#losClientes').options);
            array.forEach(function (o) {
                if(loanData[loanData.length-2]===o.value.split(' ')[0]){
                    document.querySelector("input[name='cliente']").setAttribute('value',o.value);
                }
            })
        }
    }).catch(error=>{
        console.log(error);
    });

});

let app = new Vue({
    el: '#app',
    data:{
        monto: null,
        interes: null,
        cuotas: null,
        total: null,
        modalidad: '1',
        amort: '1'
    },
    mounted: function () {
        if (loanData.length>0){
            this.monto = parseFloat(loanData[1]);
            this.interes = parseFloat(loanData[2]);
            this.cuotas = parseInt(loanData[3]);
            this.amort = loanData[4];
            this.modalidad = loanData[5];
        }
    },
    computed: {
        tabla: function () {
            let tableHTML = null;
            if (this.monto>0 && this.interes>0 && this.cuotas>0){
                let cuotas = this.cuotas, monto = this.monto, interes = this.interes/100, amort=parseInt(this.amort);
                let montoFinal = monto, totalInt = 0, tableData = [], abono = monto/cuotas;

                tableHTML =
                    '<thead>' +
                    '<tr>' +
                    '<th>Cuotas</th>' +
                    '<th>Capital Restante</th>' +
                    '<th>Abono</th>' +
                    '<th>Interés</th>' +
                    '<th>Total Pagado</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>';

                if (amort===1){
                    let a = (monto*(interes*((1+interes)**cuotas)))/(((1+interes)**cuotas)-1);

                    for (let i=1;i<=cuotas;i++){
                        tableData[0]=i;
                        tableData[1]=monto;
                        tableData[2]=a-(interes*monto);
                        tableData[3]=interes*monto;
                        tableData[4]=a;

                        totalInt+=tableData[3];

                        tableHTML += '<tr><td>'+tableData[0]+'</td><td>'+formt(tableData[1])+'</td><td>'+formt(tableData[2])+'</td><td>'+formt(tableData[3])+'</td><td>'+formt(tableData[4])+'</td></tr>';
                        monto-=tableData[2];
                    }

                }else if(amort===2){

                    for (let i=1;i<=cuotas;i++){
                        tableData[0]=i;
                        tableData[1]=monto;
                        tableData[2]=abono;
                        tableData[3]=interes*monto;
                        tableData[4]=abono+tableData[3];

                        totalInt+=tableData[3];

                        tableHTML += '<tr><td>'+tableData[0]+'</td><td>'+formt(tableData[1])+'</td><td>'+formt(tableData[2])+'</td><td>'+formt(tableData[3])+'</td><td>'+formt(tableData[4])+'</td></tr>';
                        monto-=tableData[2];
                    }

                }else{
                    let int = monto*interes;

                    for (let i=1;i<=cuotas;i++){
                        tableData[0]=i;
                        tableData[1]=monto;
                        tableData[2]=abono;
                        tableData[3]=int;
                        tableData[4]=abono+int;

                        totalInt+=tableData[3];

                        tableHTML += '<tr><td>'+tableData[0]+'</td><td>'+formt(tableData[1])+'</td><td>'+formt(tableData[2])+'</td><td>'+formt(tableData[3])+'</td><td>'+formt(tableData[4])+'</td></tr>';
                        monto-=tableData[2];
                    }
                }
                this.total = 'Capital Prestado + Interés: '+formt(parseFloat(this.monto)+parseFloat(totalInt));
                tableHTML += '</tbody>';
            }

            return tableHTML;
        }
    }
});

function formt(num) {
    let formateado = parseFloat(num);
    formateado = '$'+formateado.toLocaleString('en', {maximumFractionDigits : 2, minimumFractionDigits: 2});
    return formateado;
}

