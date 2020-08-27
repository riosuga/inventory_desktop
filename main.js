const path = require('path')
const {app, BrowserWindow, ipcMain} = require('electron')
const fs = require('fs')  
const conn = require('./util/db') 

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
const appVersion = process.env.npm_package_version

let mainWindow
let child
let sess
let role_user
let nama_user

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
      // frame: false,
    webPreferences: { 
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true ,
        webSecurity: false
    },
    show: false
  })

  child = new BrowserWindow({
    width: 1200,
    height: 600,
    frame:false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true ,
        webSecurity: false
      }
  })

  child.loadFile('app/template/login.html')
  // mainWindow.toggleDevTools()

  // child.toggleDevTools()
  mainWindow.loadFile('app/template/header.html')
})
  


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('set-login', (event, dataUser) => {
  console.log(dataUser)
  console.log('set-role nama : '+ dataUser[0]['nama_user'])
  ses = mainWindow.webContents.session

  ses.setUserAgent('login'+dataUser[0]['role_user'])
  mainWindow.webContents.send('set-role', dataUser[0]['role_user'], dataUser[0]['nama_user'])
  role_user = dataUser[0]['role_user']
  nama_user = dataUser[0]['nama_user']
  conn.update_last_login(dataUser[0]['id_user'])
  menu_stock_barang()
  mainWindow.show()
  child.hide()
})

ipcMain.on('sign_out', (event, dataUser) => {
  ses = mainWindow.webContents.session
  role_user =''
  ses.setUserAgent('')
  mainWindow.hide()
  menu_stock_barang()
  child.show()
})

function checkSession(){
  let dataSession = ses.getUserAgent()
  if(dataSession.substring(0, 5) != 'login'){
    mainWindow.hide()
    child.show()
  }else{
      role_user = dataSession.substring(5,7)
      mainWindow.webContents.send('set-role', role_user, nama_user)
  }
}

//====================================================  start menu ===============================================================================
// login
ipcMain.on('m_login',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/m_login.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
     
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
        let getAllLogin = conn.get_all_data_m_login()
            getAllLogin.then(result => {
            // console.log(result) 
            mainWindow.webContents.send('show-data', result)
          })
        })
  })

})

ipcMain.on('save_m_login',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    for(let crot of data){
      if(crot.name == 'id_user'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
        }
      }
      arrData[crot.name] = crot.value
    }
    resolve(arrData)
  })

  promising.then(content =>{
    // console.log(content)
    if(method == 'add'){
      let execute = conn.insert_m_login(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data user')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data user', 'm_login')
      }else{
        console.log('gagal insert data user')
        mainWindow.webContents.send('show-error', 'gagal insert user ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_login(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data data user')
        mainWindow.webContents.send('show-succses', 'Berhasil update data user', 'm_login')
      }else{
        console.log('gagal update data user')
        mainWindow.webContents.send('show-error', 'gagal update user ')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan '+method)
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_login',(event, id)=>{
  let execute = conn.delete_m_login(id)
  if(execute == '200'){
    console.log('sukses delete data user')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data user', 'm_login')
  }else{
    console.log('gagal delete data user')
    mainWindow.webContents.send('show-error', 'gagal delete user ')
  }
})

// =========================================================== start referensi ===================================================================
ipcMain.on('m_barang',() =>{
  checkSession()
  console.log(role_user)
  fs.readFile(__dirname + '/app/content/m_barang.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
        
        var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

      promise.then(result =>{
        let getAllSatuan = conn.get_all_data_m_barang(role_user)
        getAllSatuan.then(result => {
            //console.log(result) 
            mainWindow.webContents.send('show-data', result)
          })
        })
        .then(result =>{
            let getCbSatuan = conn.get_all_data_m_satuan('cb')
            getCbSatuan.then(result => {
              mainWindow.webContents.send('show-combobox', 'cb_satuan',result)
            })
        })
        .then(result =>{
            let getCbJenisBarang = conn.get_all_data_m_jenis_barang('cb')
            getCbJenisBarang.then(result => {
              mainWindow.webContents.send('show-combobox', 'cb_jenis_barang',result)
            })
        })
        .then(result =>{
            let getCbSupplier = conn.get_all_data_m_supplier('cb')
            getCbSupplier.then(result => {
              mainWindow.webContents.send('show-combobox', 'cb_supplier',result)
            })
        })
  })

})

ipcMain.on('save_m_barang',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    var today = new Date();
    for(let crot of data){
      if(crot.name == 'id_barang'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
          arrData.push(crot.value)
        }
      }else{
        arrData.push(crot.value)
      }
      
    }

    let tanggal = new Date(new Date() + 3600*1000*7).toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(method == 'add'){
      arrData.push(tanggal)
      arrData.push(tanggal)
    }else{
      arrData.push(tanggal)
    }
    
    resolve(arrData)
  })

  promising.then(content =>{
    if(method == 'add'){
      let execute = conn.insert_m_barang(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data barang')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data barang', 'm_barang')
      }else{
        console.log('gagal insert data barang')
        mainWindow.webContents.send('show-error', 'gagal insert barang ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_barang(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data barang')
        mainWindow.webContents.send('show-succses', 'Berhasil update data barang', 'm_barang')
      }else{
        console.log('gagal update data barang')
        mainWindow.webContents.send('show-error', 'gagal update barang')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan '+method)
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_barang',(event, id)=>{
  let execute = conn.delete_m_barang(id)
  if(execute == '200'){
    console.log('sukses delete data barang')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data barang', 'm_barang')
  }else{
    console.log('gagal delete data barang')
    mainWindow.webContents.send('show-error', 'gagal delete barang ')
  }
})

ipcMain.on('m_satuan',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/m_satuan.html', (err, data) => {
    if(err){
      mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
      return;
    }
     // mainWindow.webContents.send('print-file', data.toString())
    var promise = new Promise(function(resolve,reject){
      resolve(mainWindow.webContents.send('print-file', data.toString()))
   })

    promise.then(result =>{
      let getAllSatuan = conn.get_all_data_m_satuan()
      getAllSatuan.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
    })
  })

})

ipcMain.on('save_m_satuan',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    var today = new Date();
    for(let crot of data){
      if(crot.name == 'id_satuan'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
          arrData.push(crot.value)
        }
      }else{
        arrData.push(crot.value)
      }
      
    }

    let tanggal = new Date(new Date() + 3600*1000*7).toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(method == 'add'){
      arrData.push(tanggal)
      arrData.push(tanggal)
    }else{
      arrData.push(tanggal)
    }
    
    resolve(arrData)
  })

  promising.then(content =>{
    if(method == 'add'){
      let execute = conn.insert_m_satuan(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data satuan')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data satuan', 'm_satuan')
      }else{
        console.log('gagal insert data satuan')
        mainWindow.webContents.send('show-error', 'gagal insert satuan ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_satuan(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data satuan')
        mainWindow.webContents.send('show-succses', 'Berhasil update data satuan', 'm_satuan')
      }else{
        console.log('gagal update data satuan')
        mainWindow.webContents.send('show-error', 'gagal update satuan ')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan ')
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_satuan',(event, id)=>{
  let execute = conn.delete_m_satuan(id)
  if(execute == '200'){
    console.log('sukses delete data satuan')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data satuan', 'm_satuan')
  }else{
    console.log('gagal delete data satuan')
    mainWindow.webContents.send('show-error', 'gagal delete satuan ')
  }
})

ipcMain.on('m_jenis_barang',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/m_jenis_barang.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
     
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
        let getAllJenisBarang = conn.get_all_data_m_jenis_barang()
        getAllJenisBarang.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
        })
  })

})

ipcMain.on('save_m_jenis_barang',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    var today = new Date();
    for(let crot of data){
      if(crot.name == 'id_jenis_barang'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
          arrData.push(crot.value)
        }
      }else{
        arrData.push(crot.value)
      }
      
    }

    let tanggal = new Date(new Date() + 3600*1000*7).toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(method == 'add'){
      arrData.push(tanggal)
      arrData.push(tanggal)
    }else{
      arrData.push(tanggal)
    }
    
    resolve(arrData)
  })

  promising.then(content =>{
    if(method == 'add'){
      let execute = conn.insert_m_jenis_barang(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data jenis_barang')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data jenis_barang', 'm_jenis_barang')
      }else{
        console.log('gagal insert data jenis_barang')
        mainWindow.webContents.send('show-error', 'gagal insert jenis_barang ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_jenis_barang(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data jenis_barang')
        mainWindow.webContents.send('show-succses', 'Berhasil update data jenis_barang', 'm_jenis_barang')
      }else{
        console.log('gagal update data jenis_barang')
        mainWindow.webContents.send('show-error', 'gagal update jenis_barang ')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan ')
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_jenis_barang',(event, id)=>{
  let execute = conn.delete_m_jenis_barang(id)
  if(execute == '200'){
    console.log('sukses delete data jenis_barang')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data jenis_barang', 'm_jenis_barang')
  }else{
    console.log('gagal delete data jenis_barang')
    mainWindow.webContents.send('show-error', 'gagal delete jenis_barang ')
  }
})

ipcMain.on('m_supplier',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/m_supplier.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
    
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
        let getAllSupplier = conn.get_all_data_m_supplier()
        getAllSupplier.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
        })
  })

})

ipcMain.on('save_m_supplier',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    var today = new Date();
    for(let crot of data){
      if(crot.name == 'id_supplier'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
          arrData.push(crot.value)
        }
      }else{
        arrData.push(crot.value)
      }
      
    }

    let tanggal = new Date(new Date() + 3600*1000*7).toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(method == 'add'){
      arrData.push(tanggal)
      arrData.push(tanggal)
    }else{
      arrData.push(tanggal)
    }
    
    resolve(arrData)
  })

  promising.then(content =>{
    if(method == 'add'){
      let execute = conn.insert_m_supplier(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data supplier')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data supplier', 'm_supplier')
      }else{
        console.log('gagal insert data supplier')
        mainWindow.webContents.send('show-error', 'gagal insert supplier ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_supplier(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data supplier')
        mainWindow.webContents.send('show-succses', 'Berhasil update data supplier', 'm_supplier')
      }else{
        console.log('gagal update data supplier')
        mainWindow.webContents.send('show-error', 'gagal update supplier ')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan ')
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_supplier',(event, id)=>{
  let execute = conn.delete_m_supplier(id)
  if(execute == '200'){
    console.log('sukses delete data supplier')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data supplier', 'm_supplier')
  }else{
    console.log('gagal delete data supplier')
    mainWindow.webContents.send('show-error', 'gagal delete supplier ')
  }
})

ipcMain.on('m_tempat',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/m_tempat.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
    
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
        let getAllTempat = conn.get_all_data_m_tempat()
        getAllTempat.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
        })
  })

})

ipcMain.on('save_m_tempat',(event, data) =>{
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []
  var promising = new Promise(function(resolve, reject) {
    var today = new Date();
    for(let crot of data){
      if(crot.name == 'id_tempat'){
        if(crot.value == ''){
          method = 'add'
        }else{
          method = 'update'
          arrData.push(crot.value)
        }
      }else{
        arrData.push(crot.value)
      }
      
    }

    let tanggal = new Date(new Date() + 3600*1000*7).toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(method == 'add'){
      arrData.push(tanggal)
      arrData.push(tanggal)
    }else{
      arrData.push(tanggal)
    }
    
    resolve(arrData)
  })

  promising.then(content =>{
    if(method == 'add'){
      let execute = conn.insert_m_tempat(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses insert data tempat')
        mainWindow.webContents.send('show-succses', 'Berhasil insert data tempat', 'm_tempat')
      }else{
        console.log('gagal insert data tempat')
        mainWindow.webContents.send('show-error', 'gagal insert tempat ')
      }

    }else if(method  =='update'){
      let execute = conn.update_m_tempat(content)
      console.log(execute)
      if(execute == '200'){
        console.log('sukses update data tempat')
        mainWindow.webContents.send('show-succses', 'Berhasil update data tempat', 'm_tempat')
      }else{
        console.log('gagal update data tempat')
        mainWindow.webContents.send('show-error', 'gagal update tempat ')
      }
    }else{
      mainWindow.webContents.send('show-not-found-method', 'method tidak ditemukan ')
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_m_tempat',(event, id)=>{
  let execute = conn.delete_m_tempat(id)
  if(execute == '200'){
    console.log('sukses delete data tempat')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data tempat', 'm_tempat')
  }else{
    console.log('gagal delete data tempat')
    mainWindow.webContents.send('show-error', 'gagal delete tempat ')
  }
})


// =========================================================== start transaksi ===================================================================
ipcMain.on('t_stock_barang',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/t_stock_barang.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
            let getAllSatuan = conn.get_all_data_t_stock_barang()
            getAllSatuan.then(result => {
            mainWindow.webContents.send('show-data', result)
          })
        })
  })

})


function menu_stock_barang(){
  checkSession()
  fs.readFile(__dirname + '/app/content/t_stock_barang.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
      var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
            let getAllSatuan = conn.get_all_data_t_stock_barang()
            getAllSatuan.then(result => {
            mainWindow.webContents.send('show-data', result)
          })
        })
  })
}

ipcMain.on('t_stock_barang_detail',(event, id) =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/t_stock_barang_detail.html', (err, data) => {
    if(err){
            mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
            return;
        }
        var promise = new Promise(function(resolve,reject){
          resolve(mainWindow.webContents.send('print-file', data.toString()))
        })

        promise.then(result =>{
          let getAllSatuan = conn.get_all_data_t_stock_barang_detail(id, role_user)
            getAllSatuan.then(result => {
            mainWindow.webContents.send('show-data', result)  
          })
        })
        .then(result =>{
          let getDetail = conn.get_data_stock_detail(id)
            getDetail.then(result => {
            mainWindow.webContents.send('write-detail', result)  
          })
        })
        .then(result =>{
          mainWindow.webContents.send('write-id_barang', id)  
        })
        .then(result =>{
            let getCbSatuan = conn.get_all_data_m_tempat('cb')
            getCbSatuan.then(result => {
              mainWindow.webContents.send('show-combobox', 'cb_tempat',result)
            })
        })
  })

})

ipcMain.on('save_t_stock_barang_in',(event, data) =>{
  let id_barang
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []

  //variable harga jual dan beli
  let harga_beli = 0
  let harga_jual = 0
  let harga_jual_min = 0
  let harga_jual_max = 0
  let jumlah_barang = 0
  let jumlah_barang_last = 0

  var promising = new Promise(function(resolve, reject) {
    for(let crot of data){
      arrData[crot.name] = crot.value
    }
    resolve(arrData)
  })

  //kelar insert data
  promising.then(content =>{ 
    console.log('jumlah barang ' + content['jumlah_barang'])
    if(content['id_stock_barang'] == ''){
      console.log('masuk hitung barang')
      let datax =  conn.get_data_m_barang(content['id_barang'])
      datax.then(data_m_barang =>{
        arrData['jumlah_harga_jual_min'] = parseInt(data_m_barang[0].harga_jual_min) * content['jumlah_barang']
        arrData['jumlah_harga_jual'] = parseInt(data_m_barang[0].harga_jual) * content['jumlah_barang']
        arrData['jumlah_harga_jual_max'] = parseInt(data_m_barang[0].harga_jual_max) * content['jumlah_barang']
        arrData['jumlah_harga_beli'] = parseInt(data_m_barang[0].harga_beli) * content['jumlah_barang']
        arrData['last_in'] = content['jumlah_barang']
      })
      datax.then(dataSiapInsert =>{
        console.log(arrData)
        let execute = conn.insert_t_stock_barang(arrData, 'add_in')
        console.log('balikan execute '+execute)
        if(execute == '200'){
          console.log('sukses insert data stock barang tanpa id')
          mainWindow.webContents.send('show-succses', 'Berhasil memasukkan data barang', 't_stock_barang_in',arrData['id_barang'])
        }else{
          console.log('gagal insert data stock barang tanpa id')
          mainWindow.webContents.send('show-error', 'Gagal masukkan barang ')
        }
      })

    }else{
      console.log('masuk hitung barang')

      let data_stock =  conn.get_data_t_stock_barang(content['id_stock_barang'])
      data_stock.then(content_stock_barang =>{
        harga_jual_min = parseInt(content_stock_barang[0].jumlah_harga_jual_min)
        harga_jual = parseInt(content_stock_barang[0].jumlah_harga_jual)
        harga_jual_max = parseInt(content_stock_barang[0].jumlah_harga_jual_max)
        harga_beli = parseInt(content_stock_barang[0].jumlah_harga_beli)
        jumlah_barang_last = parseInt(content_stock_barang[0].jumlah)
        console.log('jumlah barang last '+ jumlah_barang_last)
      })

      data_stock.then(content_stock_barang =>{
        let datax =  conn.get_data_m_barang(content['id_barang'])
        datax.then(data_m_barang =>{
          arrData['jumlah_harga_jual_min'] = parseInt(harga_jual_min+ data_m_barang[0].harga_jual_min) * content['jumlah_barang']
          arrData['jumlah_harga_jual'] = parseInt(harga_jual +data_m_barang[0].harga_jual) * content['jumlah_barang']
          arrData['jumlah_harga_jual_max'] = parseInt(harga_jual_max + data_m_barang[0].harga_jual_max) * content['jumlah_barang']
          arrData['jumlah_harga_beli'] = parseInt(harga_beli+ data_m_barang[0].harga_beli) * content['jumlah_barang']
          arrData['last_in'] = content['jumlah_barang']
          arrData['jumlah_barang_sebelum'] = parseInt(jumlah_barang_last)
          arrData['jumlah_barang'] = parseInt(jumlah_barang_last) + parseInt(content['jumlah_barang'])
        })

        datax.then(dataSiapInsert =>{
          console.log(arrData)
          let execute = conn.insert_t_stock_barang(arrData, 'update_in')
          console.log('balikan execute '+execute)
          if(execute == '200'){
            console.log('sukses insert data stock dengan nomor batch '+arrData['id_stock_barang'])
            mainWindow.webContents.send('show-succses', 'Berhasil memasukkan data barang', 't_stock_barang_in',arrData['id_barang'])
          }else{
            console.log('gagal insert data stock barang dengan nomor batch '+arrData['id_stock_barang'])
            mainWindow.webContents.send('show-error', 'Gagal masukkan barang ')
          }
        })
      })
    }
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})


ipcMain.on('save_t_stock_barang_out',(event, data) =>{
  let id_barang
  let stop = data.lenght
  let tanda_akhir = 0
  let i = 0
  let method = ''
  let arrData = []

  //variable harga jual dan beli
  let harga_beli = 0
  let harga_jual = 0
  let harga_jual_min = 0
  let harga_jual_max = 0
  let jumlah_barang = 0
  let jumlah_barang_last = 0

  var promising = new Promise(function(resolve, reject) {
    for(let crot of data){
      arrData[crot.name] = crot.value
    }
    resolve(arrData)
  })

  //kelar insert data
  promising.then(content =>{ 
    console.log('masuk hitung keluar barang')
    let data_stock =  conn.get_data_t_stock_barang(content['id_stock_barang'])
    data_stock.then(content_stock_barang =>{
      harga_jual_min = parseInt(content_stock_barang[0].jumlah_harga_jual_min)
      harga_jual = parseInt(content_stock_barang[0].jumlah_harga_jual)
      harga_jual_max = parseInt(content_stock_barang[0].jumlah_harga_jual_max)
      harga_beli = parseInt(content_stock_barang[0].jumlah_harga_beli)
      jumlah_barang_last = parseInt(content_stock_barang[0].jumlah)
      console.log('jumlah barang last '+ jumlah_barang_last)
    })

    data_stock.then(content_stock_barang =>{
      let datax =  conn.get_data_m_barang(content['id_barang'])
      datax.then(data_m_barang =>{
        arrData['jumlah_harga_jual_min'] = parseInt(harga_jual_min - (data_m_barang[0].harga_jual_min * content['jumlah_barang']))
        arrData['jumlah_harga_jual'] = parseInt(harga_jual  - (data_m_barang[0].harga_jual * content['jumlah_barang']))
        arrData['jumlah_harga_jual_max'] = parseInt(harga_jual_max - (data_m_barang[0].harga_jual_max * content['jumlah_barang']))
        arrData['jumlah_harga_beli'] = parseInt(harga_beli - (data_m_barang[0].harga_beli * content['jumlah_barang']))
        arrData['last_out'] = content['jumlah_barang']
        arrData['jumlah_barang_sebelum'] = parseInt(jumlah_barang_last)
        arrData['jumlah_barang'] = parseInt(jumlah_barang_last) - parseInt(content['jumlah_barang'])
      })

      datax.then(dataSiapInsert =>{
        console.log(arrData)
        let execute = conn.insert_t_stock_barang(arrData, 'add_out')
        console.log('balikan execute '+execute)
        if(execute == '200'){
          console.log('sukses keluar barang data stock dengan nomor batch '+arrData['id_stock_barang'])
          mainWindow.webContents.send('show-succses', 'Berhasil mengeluarkan data barang', 't_stock_barang_out',arrData['id_barang'])
        }else{
          console.log('gagal keluar barang data stock barang dengan nomor batch '+arrData['id_stock_barang'])
          mainWindow.webContents.send('show-error', 'Gagal masukkan barang ')
        }
      })
    })
  })
  .catch(err =>{
    mainWindow.webContents.send('show-error', "error catch proses "+err)
  })
})

ipcMain.on('delete_t_stock_barang',(event, id, nextId)=>{
  let execute = conn.delete_t_stock_barang(id)
  if(execute == '200'){
    console.log('sukses delete data stock barang')
    mainWindow.webContents.send('show-succses', 'Berhasil delete data stock barang', 't_stock_barang_detail', nextId)
  }else{
    console.log('gagal delete data data stock barang barang')
    mainWindow.webContents.send('show-error', 'gagal delete data stock barang ')
  }
})

ipcMain.on('t_stock_barang_in',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/t_stock_barang_in.html', (err, data) => {
    if(err){
      mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
      return;
    }

    var promise = new Promise(function(resolve,reject){
      resolve(mainWindow.webContents.send('print-file', data.toString()))
    })

    promise.then(result =>{
      let getAllBarangMasuk = conn.get_all_data_t_stock_barang_masuk_detail()
      getAllBarangMasuk.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
    })
  })

})


ipcMain.on('t_stock_barang_out',() =>{
  checkSession()
  fs.readFile(__dirname + '/app/content/t_stock_barang_out.html', (err, data) => {
    if(err){
      mainWindow.webContents.send('show-error', " error ocurred reading the file :" + err.message);
      return;
    }

    var promise = new Promise(function(resolve,reject){
      resolve(mainWindow.webContents.send('print-file', data.toString()))
    })

    promise.then(result =>{
      let getAllBarangKeluar = conn.get_all_data_t_stock_barang_keluar_detail()
      getAllBarangKeluar.then(result => {
        //console.log(result) 
        mainWindow.webContents.send('show-data', result)
      })
    })
  })

})
