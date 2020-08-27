'use strict' 
// require('select2-bootstrap-css')
const { ipcRenderer} = require('electron')
const conn = require('../../util/db') 
const swal = require('sweetalert')
// const select2 = require('select2')
var jQuery = require('jquery');
require('select2')(jQuery);

// var x = require('jquery');

var save_method
let role_user

function loadMethod(nama_method, id =''){
    console.log('crot '+nama_method)
    ipcRenderer.send(nama_method, id)
}

function loadMethod2(nama_method, idDiv =''){
    console.log(idDiv)
    let id = document.getElementById(idDiv).innerText
    ipcRenderer.send(nama_method, id)
}

ipcRenderer.on('set-role', (event, datastr, nama_user) => {
    console.log('set-role '+datastr)
    console.log('set-role nama : '+nama_user)
    document.getElementById('nama_user_profile').innerHTML = nama_user
    role_user = datastr
    doHidenContent(datastr)
})

ipcRenderer.on('print-file', (event, datastr) => {
    document.getElementById("contentWriter").innerHTML = datastr
})

ipcRenderer.on('write-detail', (event, datastr) => {
    document.getElementById("detailWriter").innerHTML   = datastr
})

ipcRenderer.on('show-data', (event, datastr) => {
    document.getElementById("allData").innerHTML = datastr;
    callDataTable()
    doHidenContent(role_user)
})

ipcRenderer.on('show-combobox',(event, divId, datastr) => {
    writeCombo(divId, datastr)
})

ipcRenderer.on('write-id_barang',(event, id) => {
    document.getElementById("id_barang").value = id
    document.getElementById("id_barang2").value = id
})

ipcRenderer.on('show-succses', (event, datastr, nama_table, id='') => {
    if(nama_table == 't_stock_barang_in'){
        var promise = new Promise(function(resolve, reject) {
            $('#modal_form_in').modal('hide')
            resolve(swal("Sukses", datastr, "success"))
        })

        promise.then(content =>{
            ipcRenderer.send('t_stock_barang_detail', id)
        })

        ipcRenderer.send('t_stock_barang_detail', id)
    }else if(nama_table == 't_stock_barang_out'){
        var promise = new Promise(function(resolve, reject) {
            $('#modal_form_out').modal('hide')
            resolve(swal("Sukses", datastr, "success"))
        })

        promise.then(content =>{
            ipcRenderer.send('t_stock_barang_detail', id)
        })

        ipcRenderer.send('t_stock_barang_detail', id)
    }else{
        var promise = new Promise(function(resolve, reject) {
            $('#modal_form').modal('hide')
            resolve(swal("Sukses", datastr, "success"))
        })

        promise.then(content =>{
            ipcRenderer.send(nama_table)
        })

        ipcRenderer.send(nama_table)
    }
})

ipcRenderer.on('show-error', (event, datastr) => {
    swal("Error", datastr, "error");
})

ipcRenderer.on('show-not-found-method', (event, datastr) => {
    swal("Warning", datastr, "warning");
})

function add_data()
{
    save_method = 'add';
    $('#form')[0].reset(); // reset form on modals
    $('.form-group').removeClass('has-error'); // clear error class
    $('.help-block').empty(); // clear error string
    $('#modal_form').modal('show'); // show bootstrap modal
    $('.modal-title').text('Tambah Data'); // Set Title to Bootstrap modal title

    if(role_user == '01'){
        $('#div_harga_beli').show();
    }else{
        $('#div_harga_beli').hide();
    }
}

function add_data_in(id ='')
{   
    save_method = 'add';
    $('#form_in')[0].reset(); // reset form on modals
    $('.form-group').removeClass('has-error'); // clear error class
    $('.help-block').empty(); // clear error string
    $('#modal_form_in').modal('show'); // show bootstrap modal
    $('.modal-title').text('Tambah Barang Masuk'); // Set Title to Bootstrap modal title
    $('#id_stock_barang_in').val(id);
}

function add_data_out(id='')
{
    save_method = 'add';
    $('#form_out')[0].reset(); // reset form on modals
    $('.form-group').removeClass('has-error'); // clear error class
    $('.help-block').empty(); // clear error string
    $('#modal_form_out').modal('show'); // show bootstrap modal
    $('.modal-title').text('Tambah Barang Keluar'); // Set Title to Bootstrap modal title
    $('#id_stock_barang_out').val(id);
}

function edit_data(nama_table, id){
    console.log(nama_table)
    console.log(id)
    save_method = 'update';
    $('#form')[0].reset(); // reset form on modals
    $('.form-group').removeClass('has-error'); // clear error class
    $('.help-block').empty(); // clear error string

    let data 
    if(nama_table == 'm_supplier'){
        data = conn.get_data_m_supplier(id)
        data.then(content =>{
                document.getElementById("id_supplier").value =  content[0].id_supplier
                document.getElementById("nama_supplier").value = content[0].nama_supplier
                document.getElementById("alamat_supplier").value = content[0].alamat_supplier
                document.getElementById("contact_supplier").value = content[0].contact_supplier
                document.getElementById("email_supplier").value = content[0].email_supplier
            })
            .catch(err =>{
              console.log('error promise get database from view m_supplier ', err)
            })
    }else if(nama_table == 'm_satuan'){
        data = conn.get_data_m_satuan(id)
        data.then(content =>{
                document.getElementById("id_satuan").value =  content[0].id_satuan
                document.getElementById("nama_satuan").value = content[0].nama_satuan
                document.getElementById("keterangan").value = content[0].keterangan
            })
            .catch(err =>{
              console.log('error promise get database from view m_satuan ', err)
            })
    }else if(nama_table == 'm_jenis_barang'){
        data = conn.get_data_m_jenis_barang(id)
        data.then(content =>{
                document.getElementById("id_jenis_barang").value =  content[0].id_jenis_barang
                document.getElementById("nama_satuan").value = content[0].nama_satuan
                document.getElementById("keterangan").value = content[0].keterangan
            })
            .catch(err =>{
              console.log('error promise get database from view m_jenis_barang ', err)
            })
    }else if(nama_table == 'm_tempat'){
        data = conn.get_data_m_tempat(id)
        data.then(content =>{
                document.getElementById("id_tempat").value =  content[0].id_tempat
                document.getElementById("nama_tempat").value = content[0].nama_tempat
                document.getElementById("keterangan_tempat").value = content[0].keterangan_tempat
            })
            .catch(err =>{
              console.log('error promise get database from view m_tempat ', err)
            })
    }else if(nama_table == 'm_barang'){
        data = conn.get_data_m_barang(id)
        data.then(content =>{
                document.getElementById("id_barang").value =  content[0].id_barang
                document.getElementById("nama_barang").value =  content[0].nama_barang
                document.getElementById("harga_jual_min").value =  content[0].harga_jual_min
                document.getElementById("harga_jual").value =  content[0].harga_jual
                document.getElementById("harga_jual_max").value =  content[0].harga_jual_max
                document.getElementById("harga_beli").value =  content[0].harga_beli
                document.getElementById("jumlah_barang_minimum").value =  content[0].jumlah_barang_minimum

                let getCbSatuan = conn.get_all_data_m_satuan('cb', content[0].id_satuan)
                getCbSatuan.then(result => {
                    console.log(getCbSatuan)
                    writeCombo('cb_satuan', result)
                })

                let getCbSupplier = conn.get_all_data_m_supplier('cb', content[0].id_supplier)
                getCbSupplier.then(result => {
                     writeCombo('cb_supplier', result)
                })

                let getCbJenisBarang = conn.get_all_data_m_jenis_barang('cb', content[0].id_jenis_barang)
                getCbJenisBarang.then(result => {
                     writeCombo('cb_jenis_barang', result)
                })
            })
        .catch(err =>{
              console.log('error promise get database from view m_barang ', err)
            })

        if(role_user == '01'){
            $('#div_harga_beli').show();
        }else{
            $('#div_harga_beli').hide();
        }
    }else if(nama_table == 'm_login'){
        data = conn.get_data_m_login(id)
        data.then(content =>{
                document.getElementById("id_user").value =  content[0].id_user
                document.getElementById("nama_user").value =  content[0].nama_user
                document.getElementById("username").value = content[0].username
                document.getElementById("password").value =  content[0].password
                document.getElementById("email").value = content[0].password
                document.getElementById("alamat").value = content[0].alamat
                document.getElementById("no_telp").value = content[0].no_telp
            })
            .catch(err =>{
              console.log('error promise get database from view m_jenis_barang ', err)
            })
    }

    $('#modal_form').modal('show'); // show bootstrap modal
    $('.modal-title').text('Update Data');
}

function save(nama_table){
    if(nama_table == 't_stock_barang_in'){
        let data = $('#form_in').serializeArray();
        ipcRenderer.send('save_'+nama_table,data)
    }else if(nama_table == 't_stock_barang_out'){
        let last_stock = conn.get_last_stock_barang(document.getElementById("id_stock_barang_out").value)
        let data = $('#form_out').serializeArray();
        last_stock.then(content =>{
            if(typeof content != "undefined" && content != null && content.length != null && content.length > 0){

                if(document.getElementById("jumlah_barang2").value > parseInt(content[0].jumlah)){
                    swal("Error", "Barang tidak bisa dikeluarkan, karena kurang stock", "error");
                }else{
                    console.log(document.getElementById("jumlah_barang").value)
                    if((parseInt(content[0].jumlah) - document.getElementById("jumlah_barang2").value) < content[0].jumlah_barang_minimum){
                        swal("BARANG SUDAH HAMPIR HABIS", "Barang yang dikeluarkan telah melebihi batas, harap pesan lagi untuk barang yang akan dikeluarkan", "warning")
                        .then((content) =>{
                            // console.log('crot minimum');
                            ipcRenderer.send('save_'+nama_table,data)
                        })
                    }else{
                        // console.log('crot maximum')
                        ipcRenderer.send('save_'+nama_table,data)
                    }
                }

                
            }else{
                swal("Error", "Jumlah barang tidak ditemukan harap hubungi admin", "error");
            }
        })

        // let data = $('#form_out').serializeArray();
        // ipcRenderer.send('save_'+nama_table,data)

        
    }else{
        let data = $('#form').serializeArray();
        ipcRenderer.send('save_'+nama_table,data)
    }
}

function delete_data(nama_table, id, nextId = ''){
    if(nextId == ''){
        ipcRenderer.send('delete_'+nama_table,id)
    }else{
        ipcRenderer.send('delete_'+nama_table,id, nextId)
    }
    
}

function writeCombo(divId,datastr){
    let writeCombo = '<select class="form-control select2" id ="'+divId+'" name ="'+divId+'" tabindex="-1">'
    var promise = new Promise(function(resolve, reject) {
        writeCombo += datastr
        writeCombo += '</select>'
        resolve(writeCombo)
    })

    promise.then(result =>{
        document.getElementById(divId).innerHTML = writeCombo

    })
}

function doHidenContent(role_user){
    console.log('dohidden '+role_user)
    if(role_user == '02'){
        $('#menu_log_masuk').hide();
        $('#menu_log_keluar').hide();
        $('#div_menu_master').show();
        $('#div_penjualan').hide();
        $('#div_menu_user').hide();
        $('.hapus_barang').hide();
        $('.barang_in').show();
        $('.barang_out').hide();
        $('#btn_barang_in').show();
    }else if(role_user == '03'){
        $('#menu_log_masuk').hide();
        $('#menu_log_keluar').hide();
        $('#div_menu_master').hide();
        $('#div_penjualan').hide();
        $('#div_menu_user').hide();
        $('.hapus_barang').hide();
        $('.barang_in').hide();
        $('.barang_out').show();
        $('#btn_barang_in').hide();
    }else{
        $('#menu_log_masuk').show();
        $('#menu_log_keluar').show();
        $('#div_menu_master').show();
        $('#div_penjualan').show();
        $('#div_menu_user').show();
        $('.hapus_barang').show();
        $('.barang_in').show();
        $('.barang_out').show();
        $('#btn_barang_in').show();
    }
}

function sign_out(){
    ipcRenderer.send('sign_out', 'ok')
}