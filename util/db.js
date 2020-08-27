const sqlite3 = require('sqlite3').verbose();
const path = require('path')
let db

//====================================================  util connect db ==============================================================================

function openDB(){
  db = new sqlite3.Database(path.join(__dirname,'db_inventory.db'),(err) => {
    if (err) {
      return console.error(err.message);
    }
  })
}

function closeDB(){
  // db.close();
}

//====================================================  get load data ============================================================================
//login
exports.checkLogin = function(username, password){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
    db.each("SELECT * FROM login where username ='"+username+"' and password ='"+password+"' and flag_blokir ='N'",  function(err, row) {
      data.push(row)
    }, (err, n) => {
      if (err) {
        closeDB();
        reject(err);
      } else {
        closeDB();
        resolve(data);
      }
    })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database login ', err)
  })

  return promising
}

exports.get_all_data_m_login = function(){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT id_user, nama_user, username, password, email, no_telp, case when flag_blokir ='Y' then 'Blokir' else 'Tidak Blokir' end as flag_blokir,  case when role_user ='01' then 'Admin' when role_user ='02' then 'Tukang Input Barang' when role_user ='03' then 'Tukang Output Barang' else '-' end as role_user, last_login FROM login",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data user :" + err.message);
          reject(err)
        }else{
          string_return +='<tr><td>'+row.nama_user+'</td><td>'+row.username+'</td><td>'+row.password+'</td><td>'+row.email+'</td><td>'+row.no_telp+'</td><td>'+row.flag_blokir+'</td><td>'+row.role_user+'</td><td>'+row.last_login
          +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_login\',\''+row.id_user+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
          +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_login\',\''+row.id_user+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database user ', err)
  })

  return promising
}

exports.insert_m_login = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("INSERT INTO login(nama_user, username, password, email, alamat, no_telp, role_user, flag_blokir, wk_rekam, wk_upd) VALUES ('"+data['nama_user']+"','"+data['username']+"','"+data['password']+"','"+data['email']+"','"+data['alamat']+"','"+data['no_telp']+"','"+data['role_user']+"','"+data['flag_blokir']+"', datetime(), datetime())" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      
    }
    closeDB();
  });

  return callback
}

exports.update_m_login = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("UPDATE login SET nama_user = '"+data['nama_user']+"',username = '"+data['username']+"',password = '"+data['password']+"',email = '"+data['email']+"',alamat = '"+data['alamat']+"',no_telp = '"+data['no_telp']+"',role_user = '"+data['role_user']+"',flag_blokir = '"+data['flag_blokir']+"', wk_upd = datetime() WHERE id_user ='"+data['id_user']+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_login = function(id){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM login where id_user ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database login ', err)
  })

  return promising
}

exports.delete_m_login = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM login WHERE id_user ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.update_last_login = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("UPDATE login set last_login =datetime() WHERE id_user ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}


// =========================================================== start referensi ===================================================================

exports.get_all_data_m_barang = function(role_user){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      if(role_user == '01'){
        db.each("SELECT * FROM m_barang a join m_supplier b on a.id_supplier = b.id_supplier join m_satuan c on a.id_satuan = c.id_satuan join m_jenis_barang d on a.id_jenis_barang = d.id_jenis_barang ",  function(err, row) {
          if(err){
            console.log("Error gagal ambil data barang :" + err.message);
            reject(err)
          }else{
            string_return +='<tr><td>'+row.nama_barang+'</td><td>'+row.nama_satuan+'</td><td>'+row.nama_jenis_barang+'</td><td>'+row.nama_supplier+'</td><td>'+row.harga_jual+'</td><td>'+row.harga_beli+'</td><td>'+row.jumlah_barang_minimum+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
            +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_barang\',\''+row.id_barang+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
            +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_barang\',\''+row.id_barang+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
          }
        }, (err, n) => {
          if (err) {
            closeDB();
            reject(err);
          } else {
            closeDB();
            resolve(string_return);
          }
      })  
    }else{
      db.each("SELECT * FROM m_barang a join m_supplier b on a.id_supplier = b.id_supplier join m_satuan c on a.id_satuan = c.id_satuan join m_jenis_barang d on a.id_jenis_barang = d.id_jenis_barang",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data barang :" + err.message);
          reject(err)
        }else{
          string_return +='<tr><td>'+row.nama_barang+'</td><td>'+row.nama_satuan+'</td><td>'+row.nama_jenis_barang+'</td><td>'+row.nama_supplier+'</td><td>'+row.harga_jual+'</td><td>-</td><td>'+row.jumlah_barang_minimum+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
          +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_barang\',\''+row.id_barang+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
          +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_barang\',\''+row.id_barang+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    }
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database m_barang ', err)
  })

  return promising
}

exports.get_all_data_m_satuan = function(custom = '', id =''){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_satuan",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data satuan :" + err.message);
          reject(err)
        }else{
          if(custom == 'cb'){
            if(id != '' && id == row.id_satuan){
              string_return += "<option value ='"+row.id_satuan+"' selected>"+row.nama_satuan+"</option>"
            }else{
              string_return += "<option value ='"+row.id_satuan+"'>"+row.nama_satuan+"</option>"
            }
          }else{
            string_return +='<tr><td>'+row.nama_satuan+'</td><td>'+row.keterangan+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
            +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_satuan\',\''+row.id_satuan+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
            +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_satuan\',\''+row.id_satuan+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
          }
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_satuan ', err)
  })

  return promising
}

exports.get_all_data_m_jenis_barang = function(custom ='', id =''){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_jenis_barang",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data jenis barang :" + err.message);
          reject(err)
        }else{
          if(custom == 'cb'){
            if(id != '' && id == row.id_jenis_barang){
              string_return += "<option value ='"+row.id_jenis_barang+"' selected>"+row.nama_jenis_barang+"</option>"
            }else{
              string_return += "<option value ='"+row.id_jenis_barang+"'>"+row.nama_jenis_barang+"</option>"
            }
          }else{
            string_return +='<tr><td>'+row.nama_jenis_barang+'</td><td>'+row.keterangan+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
            +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_jenis_barang\',\''+row.id_jenis_barang+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
            +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_jenis_barang\',\''+row.id_jenis_barang+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
          }
          
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_jenis_barang ', err)
  })

  return promising
}

exports.get_all_data_m_supplier = function(custom ='' , id =''){
  openDB();
  
  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_supplier",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data supplier :" + err.message);
          reject(err)
        }else{
          if(custom == 'cb'){
            if(id != '' && id== row.id_supplier){
              string_return += "<option value ='"+row.id_supplier+"' selected>"+row.nama_supplier+"</option>"
            }else{
              string_return += "<option value ='"+row.id_supplier+"'>"+row.nama_supplier+"</option>"
            }
          }else{
            string_return +='<tr><td>'+row.nama_supplier+'</td><td>'+row.alamat_supplier+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
            +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_supplier\',\''+row.id_supplier+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
            +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_supplier\',\''+row.id_supplier+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
          }
        }
      }, (err, n) => {
        if (err) {
          // closeDB();
          reject(err);
        } else {
          // closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{  
    closeDB()
  })
  .catch(err =>{
    console.log('error promise get database m_supplier ', err)
  })

  return promising
}

exports.get_all_data_m_tempat = function(custom ='', id =''){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_tempat",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data tempat :" + err.message);
          reject(err)
        }else{
          if(custom == 'cb'){
            if(id != '' && id== row.id_satuan){
              string_return += "<option value ='"+row.id_tempat+"' selected>"+row.nama_tempat+"</option>"
            }else{
              string_return += "<option value ='"+row.id_tempat+"'>"+row.nama_tempat+"</option>"
            }
          }else{
            string_return +='<tr><td>'+row.nama_tempat+'</td><td>'+row.keterangan_tempat+'</td><td>'+row.wk_rekam+'</td><td>'+row.wk_upd
            +'</td><td><a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Edit" onclick="edit_data(\'m_tempat\',\''+row.id_tempat+'\')"><i class="glyphicon glyphicon-pencil"></i> Edit</a>'
            +'<a class="btn btn-sm btn-danger" href="javascript:void(0)" title="Edit" onclick="delete_data(\'m_tempat\',\''+row.id_tempat+'\')"><i class="glyphicon glyphicon-trash"></i> Delete</a></td></tr>'
          }
          
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_tempat ', err)
  })

  return promising
}

// ==================================================== start transaksi referensi ====================================================
exports.insert_m_supplier = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("INSERT INTO m_supplier(nama_supplier, alamat_supplier, contact_supplier, email_supplier, wk_rekam, wk_upd) VALUES ('"+data[0]+"','"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"')" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      
    }
    closeDB();
  });

  return callback
}

exports.update_m_supplier = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("UPDATE m_supplier SET nama_supplier = '"+data[1]+"',alamat_supplier = '"+data[2]+"',contact_supplier = '"+data[3]+"',email_supplier = '"+data[4]+"',wk_upd = '"+data[5]+"' WHERE id_supplier ='"+data[0]+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_supplier = function(id){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_supplier where id_supplier ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_supplier ', err)
  })

  return promising
}

exports.delete_m_supplier = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM m_supplier WHERE id_supplier ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.insert_m_barang = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run(
    "INSERT INTO m_barang(nama_barang, id_supplier, id_jenis_barang, id_satuan, harga_jual_min, harga_jual, harga_jual_max,harga_beli, jumlah_barang_minimum,wk_rekam, wk_upd)"
    +" VALUES ('"+data[0]+"','"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"','"+data[6]+"','"+data[7]+"','"+data[8]+"','"+data[9]+"','"+data[10]+"')" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      return callback
    }
    closeDB();
  });

  return callback
}

exports.update_m_barang = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run(
    "UPDATE m_barang SET nama_barang = '"+data[1]+"',id_supplier = '"+data[2]
    +"',id_jenis_barang = '"+data[3]+"',id_satuan = '"+data[4]+"',harga_jual_min = '"+data[5]+"'"
    +",harga_jual = '"+data[6]+"',harga_jual_max = '"+data[7]+"',harga_beli = '"+data[8]+"',jumlah_barang_minimum = '"+data[9]+"',wk_upd = '"+data[10]+"'"
    +"WHERE id_barang ='"+data[0]+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_barang = function(id){
  openDB();
  console.log(id)
  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_barang where id_barang ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_barang ', err)
  })

  return promising
}

exports.delete_m_barang = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM m_barang WHERE id_barang ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.insert_m_satuan = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("INSERT INTO m_satuan(nama_satuan, keterangan, wk_rekam, wk_upd) VALUES ('"+data[0]+"','"+data[1]+"','"+data[2]+"','"+data[3]+"')" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      
    }
    closeDB();
  });

  return callback
}

exports.update_m_satuan = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("UPDATE m_satuan SET nama_satuan = '"+data[1]+"',keterangan = '"+data[2]+"', wk_upd = '"+data[3]+"' WHERE id_satuan ='"+data[0]+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_satuan = function(id){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_satuan where id_satuan ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_satuan ', err)
  })

  return promising
}

exports.delete_m_satuan = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM m_satuan WHERE id_satuan ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.insert_m_jenis_barang = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("INSERT INTO m_jenis_barang(nama_jenis_barang, keterangan, wk_rekam, wk_upd) VALUES ('"+data[0]+"','"+data[1]+"','"+data[2]+"','"+data[3]+"')" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      
    }
    closeDB();
  });

  return callback
}

exports.update_m_jenis_barang = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("UPDATE m_jenis_barang SET nama_jenis_barang = '"+data[1]+"',keterangan = '"+data[2]+"', wk_upd = '"+data[3]+"' WHERE id_jenis_barang ='"+data[0]+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_jenis_barang = function(id){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_jenis_barang where id_jenis_barang ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_jenis_barang ', err)
  })

  return promising
}

exports.delete_m_jenis_barang = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM m_jenis_barang WHERE id_jenis_barang ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.insert_m_tempat = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("INSERT INTO m_tempat(nama_tempat, keterangan_tempat, wk_rekam, wk_upd) VALUES ('"+data[0]+"','"+data[1]+"','"+data[2]+"','"+data[3]+"')" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
      
    }
    closeDB();
  });

  return callback
}

exports.update_m_tempat = function(data){
  openDB();
  console.log(data)
  let callback = '200'
  db.run("UPDATE m_tempat SET nama_tempat = '"+data[1]+"',keterangan_tempat = '"+data[2]+"', wk_upd = '"+data[3]+"' WHERE id_tempat ='"+data[0]+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_data_m_tempat = function(id){
  openDB();

  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM m_tempat where id_tempat ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database m_tempat ', err)
  })

  return promising
}

exports.delete_m_tempat = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM m_tempat WHERE id_tempat ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_all_data_t_stock_barang = function(){
  openDB();

  let string_return =''
  let increment = 1;
  var promising = new Promise(function(resolve, reject) {
      db.each(
            "select a.id_barang,nama_barang,c.nama_jenis_barang, e.nama_supplier, group_concat(b.jumlah,'<br>') as current_stock, group_concat(d.nama_tempat,'<br>') as lokasi "
            +"from m_barang a "
            +"left join t_stock_barang b on a.id_barang = b.id_barang "
            +"join m_jenis_barang c on a.id_jenis_barang = c.id_jenis_barang "
            +"join m_supplier e on a.id_supplier = e.id_supplier "
            +"left join m_tempat d on b.id_tempat = d.id_tempat "
            +"GROUP by a.id_barang "
            +"order by b.id_barang desc",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data barang :" + err.message);
          reject(err)
        }else{  

        if(row.current_stock == null){
          row.current_stock = 'Kosong'
        }

        if(row.lokasi == null){
          row.lokasi = 'Kosong'
        }

        string_return += '<tr>'
                            +'<td>'
                              +row.nama_barang
                            +'</td>'
                            +'<td>'
                              +row.nama_jenis_barang
                            +'</td>'
                            +'<td>'
                              +row.nama_supplier
                            +'</td>'
                            +'<td>'
                              +row.current_stock
                            +'</td>'
                            +'<td>'
                              +row.lokasi
                            +'</td>'
                            +'<td>'
                              +'<a class="btn btn-sm btn-primary" href="javascript:void(0)" title="Detail" onclick="loadMethod(\'t_stock_barang_detail\',\''+row.id_barang+'\')"><i class="glyphicon glyphicon-search"></i> Detail</a>'
                            +'</td>'
                        +'</tr>'

        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang ', err)
  })

  return promising
}

exports.get_all_data_t_stock_barang_detail = function(id, role_user){
  openDB();

  let string_return =''
  let increment = 1;
  var promising = new Promise(function(resolve, reject) {
      if(role_user != '01'){
        db.each(
              "SELECT id_stock_barang, 'Current Stock : '|| a.jumlah ||'<br>Barang Masuk : '|| a.last_in|| '<br>Barang Keluar : '|| IFNULL(a.last_out,'-') as jumlah, 'Tanggal Masuk : '|| tanggal_last_in ||'<br>Tanggal Keluar : ' || IFNULL(tanggal_last_out,'-') as tanggal, b.nama_tempat, 'Jumlah Harga Beli : -<br>Jumlah Harga Jual : ' || jumlah_harga_jual || '<br>Jumlah Harga Jual Satuan : ' || jumlah_harga_jual_min || '<br>Jumlah Harga Jual Partai : ' || jumlah_harga_jual_max as harga, a.wk_rekam, a.wk_upd FROM t_stock_barang a "
              +"JOIN m_tempat b on a.id_tempat = b.id_tempat "
              +"WHERE a.id_barang = '"+id+"'"
              +"order by a.id_stock_barang desc",  function(err, row) {
          if(err){
            console.log("Error gagal ambil data barang detail :" + err.message);
            reject(err)
          }else{  

            string_return += '<tr>'
                              +'<td>'
                                +'T-'+row.id_stock_barang
                              +'</td>'
                              +'<td>'
                                +row.jumlah
                              +'</td>'
                              +'<td>'
                                +row.tanggal
                              +'</td>'
                              +'<td>'
                                +row.nama_tempat
                              +'</td>'
                              +'<td>'
                                +row.harga
                              +'</td>'
                              +'<td>'
                                +'<a class="btn btn-sm btn-primary barang_in" href="javascript:void(0)" title="Detail" onclick="add_data_in(\''+row.id_stock_barang+'\')"><i class="glyphicon glyphicon-pencil"></i> Tambah Barang Masuk</a><br><br>'
                                +'<a class="btn btn-sm btn-warning barang_out" href="javascript:void(0)" title="Detail" onclick="add_data_out(\''+row.id_stock_barang+'\')"><i class="fa fa-fw fa-sign-out"></i>Tambah Barang Keluar</a><br><br>'
                                +'<a class="btn btn-sm btn-danger hapus_barang" href="javascript:void(0)" title="Detail" onclick="delete_data(\'t_stock_barang\',\''+row.id_stock_barang+'\')"><i class="glyphicon glyphicon-trash"></i> Hapus</a>'
                              +'</td>'
                          +'</tr>'

          }
        }, (err, n) => {
          if (err) {
            closeDB();
            reject(err);
          } else {
            closeDB();
            resolve(string_return);
          }
        })  
      }else{
        db.each(
              "SELECT id_stock_barang, 'Current Stock : '|| a.jumlah ||'<br>Barang Masuk : '|| a.last_in|| '<br>Barang Keluar : '|| IFNULL(a.last_out,'-') as jumlah, 'Tanggal Masuk : '|| tanggal_last_in ||'<br>Tanggal Keluar : ' || IFNULL(tanggal_last_out,'-') as tanggal, b.nama_tempat, 'Jumlah Harga Beli : ' || jumlah_harga_beli || '<br>Jumlah Harga Jual : ' || jumlah_harga_jual || '<br>Jumlah Harga Jual Satuan : ' || jumlah_harga_jual_min || '<br>Jumlah Harga Jual Partai : ' || jumlah_harga_jual_max as harga, a.wk_rekam, a.wk_upd FROM t_stock_barang a "
              +"JOIN m_tempat b on a.id_tempat = b.id_tempat "
              +"WHERE a.id_barang = '"+id+"'"
              +"order by a.id_stock_barang desc",  function(err, row) {
          if(err){
            console.log("Error gagal ambil data barang detail :" + err.message);
            reject(err)
          }else{  

            string_return += '<tr>'
                              +'<td>'
                                +'T-'+row.id_stock_barang
                              +'</td>'
                              +'<td>'
                                +row.jumlah
                              +'</td>'
                              +'<td>'
                                +row.tanggal
                              +'</td>'
                              +'<td>'
                                +row.nama_tempat
                              +'</td>'
                              +'<td>'
                                +row.harga
                              +'</td>'
                              +'<td>'
                                +'<a class="btn btn-sm btn-primary barang_in" href="javascript:void(0)" title="Detail" onclick="add_data_in(\''+row.id_stock_barang+'\')"><i class="glyphicon glyphicon-pencil"></i> Tambah Barang Masuk</a><br><br>'
                                +'<a class="btn btn-sm btn-warning barang_out" href="javascript:void(0)" title="Detail" onclick="add_data_out(\''+row.id_stock_barang+'\')"><i class="fa fa-fw fa-sign-out"></i>Tambah Barang Keluar</a><br><br>'
                                +'<a class="btn btn-sm btn-danger hapus_barang" href="javascript:void(0)" title="Detail" onclick="delete_data(\'t_stock_barang\',\''+row.id_stock_barang+'\')"><i class="glyphicon glyphicon-trash"></i> Hapus</a>'
                              +'</td>'
                          +'</tr>'

          }
        }, (err, n) => {
          if (err) {
            closeDB();
            reject(err);
          } else {
            closeDB();
            resolve(string_return);
          }
        }) 
      }
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang ', err)
  })

  return promising
}

exports.get_data_stock_detail = function(id){
  openDB();

  let string_return =''
  let increment = 1;
  var promising = new Promise(function(resolve, reject) {
      db.each(
            "SELECT nama_barang, nama_supplier, nama_satuan, nama_jenis_barang, alamat_supplier, email_supplier FROM m_barang a "
            +"JOIN m_satuan b on a.id_satuan = b.id_satuan "
            +"JOIN m_supplier c on a.id_supplier = c.id_supplier "
            +"JOIN m_jenis_barang b on a.id_jenis_barang = b.id_jenis_barang "
            +"WHERE a.id_barang = '"+id+"'",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data barang detail :" + err.message);
          reject(err)
        }else{  
        string_return += 
            '<div class="col-lg-4">'
                +'<span class="info-box-text">Nama Barang</span>'
                +'<span class="info-box-number">'+row.nama_barang+'</span>'
                +'<span class="info-box-text">Nama Supplier</span>'
                +'<span class="info-box-number">'+row.nama_supplier+'</span>'
            +'</div>'
            +'<div class="col-lg-4">'
                +'<span class="info-box-text">Jenis barang</span>'
                +'<span class="info-box-number">'+row.nama_jenis_barang+'</span>'
                +'<span class="info-box-text">Contact Supplier</span>'
                +'<span class="info-box-number">'+row.email_supplier+'</span>'
            +'</div>'
            +'<div class="col-lg-4">'
                +'<span class="info-box-text">Satuan Barang</span>'
                +'<span class="info-box-number">'+row.nama_satuan+'</span>'
                +'<span class="info-box-text">Alamat Supplier</span>'
                +'<span class="info-box-number">'+row.alamat_supplier+'</span>'
            +'</div>'

        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang ', err)
  })

  return promising
}

exports.get_data_t_stock_barang = function(id){
  openDB();
  console.log(id)
  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM t_stock_barang where id_stock_barang ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          // console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang ', err)
  })

  return promising
}

exports.get_last_stock_barang = function(id){
  openDB();
  console.log('id yang masuk '+id)
  let data = []
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT a.jumlah, b.jumlah_barang_minimum FROM t_stock_barang a left join m_barang b on a.id_barang = b.id_barang where a.id_stock_barang ='"+id+"'",  function(err, row) {
        //console.log(row)
        data.push(row)
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          console.log(data)
          resolve(data);
        }
      })  
    
  })

  promising.then(content =>{  
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang ', err)
  })

  return promising
}

exports.insert_t_stock_barang = function(data, method){
  let callback ='200'
  if(method == 'add_in'){
    db.run("INSERT INTO t_stock_barang(id_barang, id_tempat, jumlah, last_in, tanggal_last_in, jumlah_harga_beli, jumlah_harga_jual, jumlah_harga_jual_min,jumlah_harga_jual_max,wk_rekam,wk_upd) " 
           +"VALUES ('"+data['id_barang']+"','"+data['cb_tempat']+"','"+data['jumlah_barang']+"','"+data['last_in']+"','"+data['tanggal_last_in']+"','"+data['jumlah_harga_beli']+"','"+data['jumlah_harga_jual']+"','"+data['jumlah_harga_jual_min']+"','"+data['jumlah_harga_jual_max']+"',datetime(),datetime())" , function(err) {
      if (err) {
        closeDB();
        console.log(err)
        callback ='400'
      }

      db.run("INSERT INTO t_stock_barang_masuk_detail(id_stock_barang, jumlah_barang, jumlah_barang_sebelum, tanggal_masuk, id_user, wk_rekam)" 
           +"VALUES ('"+this.lastID+"','"+data['jumlah_barang']+"',0,'"+data['tanggal_last_in']+"','1',datetime())" , function(err2) {
              if (err) {
                closeDB();
                console.log(err2)
                callback ='400'
              }

              closeDB();
              callback ='200'
           })
    });
  }else if(method == 'update_in'){
    db.run("UPDATE t_stock_barang SET id_barang ='"+data['id_barang']+"',jumlah ='"+data['jumlah_barang']+"',last_in ='"+data['last_in']+"',tanggal_last_in ='"+data['tanggal_last_in']+"',jumlah_harga_beli ='"+data['jumlah_harga_beli']+"',jumlah_harga_jual ='"+data['jumlah_harga_jual']+"',jumlah_harga_jual_min ='"+data['jumlah_harga_jual_min']+"',jumlah_harga_jual_max ='"+data['jumlah_harga_jual_max']+"',wk_upd = datetime() " 
           +"WHERE id_stock_barang ='"+data['id_stock_barang']+"'" , function(err) {
      if (err) {
        closeDB();
        console.log(err)
        callback ='400'
      }

      db.run("INSERT INTO t_stock_barang_masuk_detail(id_stock_barang, jumlah_barang, jumlah_barang_sebelum, tanggal_masuk, id_user, wk_rekam)" 
           +"VALUES ('"+data['id_stock_barang']+"','"+data['last_in']+"','"+data['jumlah_barang_sebelum']+"','"+data['tanggal_last_in']+"','1',datetime())" , function(err2) {
              if (err) {
                closeDB();
                console.log(err2)
                callback ='400'
              }

              closeDB();
              callback ='200'
           })
    });
  }else if(method == 'add_out'){
    db.run("UPDATE t_stock_barang SET id_barang ='"+data['id_barang']+"',jumlah ='"+data['jumlah_barang']+"',last_out ='"+data['last_out']+"',tanggal_last_out ='"+data['tanggal_last_out']+"',jumlah_harga_beli ='"+data['jumlah_harga_beli']+"',jumlah_harga_jual ='"+data['jumlah_harga_jual']+"',jumlah_harga_jual_min ='"+data['jumlah_harga_jual_min']+"',jumlah_harga_jual_max ='"+data['jumlah_harga_jual_max']+"',wk_upd = datetime() " 
           +"WHERE id_stock_barang ='"+data['id_stock_barang']+"'" , function(err) {
      if (err) {
        closeDB();
        console.log(err)
        callback ='400'
      }

      db.run("INSERT INTO t_stock_barang_keluar_detail(id_stock_barang, jumlah_barang, jumlah_barang_sebelum, tanggal_keluar, id_user, wk_rekam)" 
           +"VALUES ('"+data['id_stock_barang']+"','"+data['last_out']+"','"+data['jumlah_barang_sebelum']+"','"+data['tanggal_last_out']+"','1',datetime())" , function(err2) {
              if (err) {
                closeDB();
                console.log(err2)
                callback ='400'
              }

              closeDB();
              callback ='200'
           })
    });
  }else{
    callback ='400'
  }

  return callback
}

exports.delete_t_stock_barang = function(id){
  openDB();
  console.log(id)
  let callback = '200'
  db.run("DELETE FROM t_stock_barang WHERE id_stock_barang ='"+id+"'" , function(err) {
    if (err) {
      closeDB();
      console.log(err)
      callback = '400'
    }
    closeDB();
  });

  return callback
}

exports.get_all_data_t_stock_barang_masuk_detail = function(){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM t_stock_barang_masuk_detail a join t_stock_barang b on a.id_stock_barang = b.id_stock_barang join m_barang c on b.id_barang = c.id_barang",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data stock masuk barang :" + err.message);
          reject(err)
        }else{
          string_return +='<tr><td>'+row.nama_barang+'</td><td>'+row.jumlah_barang+'</td><td>'+row.jumlah_barang_sebelum+'</td><td>'+row.tanggal_masuk+'</td><td>Admin</td><td>'+row.wk_rekam+'</td></tr>'
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang_masuk_detail ', err)
  })

  return promising
}

exports.get_all_data_t_stock_barang_keluar_detail = function(){
  openDB();

  let string_return =''
  var promising = new Promise(function(resolve, reject) {
      db.each("SELECT * FROM t_stock_barang_keluar_detail a join t_stock_barang b on a.id_stock_barang = b.id_stock_barang join m_barang c on b.id_barang = c.id_barang",  function(err, row) {
        if(err){
          console.log("Error gagal ambil data stock keluar barang :" + err.message);
          reject(err)
        }else{
          string_return +='<tr><td>'+row.nama_barang+'</td><td>'+row.jumlah_barang+'</td><td>'+row.jumlah_barang_sebelum+'</td><td>'+row.tanggal_keluar+'</td><td>Admin</td><td>'+row.wk_rekam+'</td></tr>'
        }
      }, (err, n) => {
        if (err) {
          closeDB();
          reject(err);
        } else {
          closeDB();
          resolve(string_return);
        }
      })  
    
  })

  promising.then(content =>{ 
  })
  .catch(err =>{
    console.log('error promise get database t_stock_barang_keluar_detail ', err)
  })

  return promising
}


module.exports