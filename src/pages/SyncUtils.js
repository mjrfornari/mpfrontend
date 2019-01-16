import PouchDB from 'pouchdb';
import {geraPk, dateSql, removeAcento} from './Utils';
import {versao} from '../App'

// const server = 'http://187.44.93.73:8080';

export const server = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "") ? 'http://localhost:3001/api': 'https://macropecasweb.sytes.net:8080/api';
const db = new PouchDB('macropecas', {auto_compaction: true});


function createTable(table, callback){
    console.log('aqui')
    db.put(table).then((res) => {
        callback(res)
    }).catch((err) => {
        console.log(err)
    })
}


async function createToFirebird(callback) {
  return new Promise(async (resolve, reject)=>{
    let create = {
        _id: 'create',
        data:  [],
        _rev: 0
    }
    let pedidos = []
    // eslint-disable-next-line
    let itepedidos = []
    await db.get('create').then(async function(doc) { 
        create.data = doc.data
        create._rev = doc._rev
        let clientes = doc.data.clientes
        pedidos = doc.data.pedidos
        const geraPkListPromise = await clientes.map((element, index) => geraPk('PK_CLI').then(Data => ( { ...element, PK_CLI: Data[0].VALOR })))
        
        return Promise.all(geraPkListPromise)
    }).then(async data => {
        create.data.clientes = data
        const geraPkListPormisePedidos = await pedidos.map((element, index) => geraPk('PK_PED').then(Data => ( { ...element, PK_PED: Data[0].VALOR })))
        // newCreate.data.pedidos = data.data.pedidos

        return Promise.all(geraPkListPormisePedidos)
    }).then(async data => {
        
        const geraPkListPormisePedidos = await data.map((element, index) => geraPk('NUMWEB').then(Data => ( { ...element, NUMWEB: Data[0].VALOR+1+index })))
        // console.log(data)
        return Promise.all(geraPkListPormisePedidos)
    }).then(async data => {
        let itens = []
        create.data.pedidos = data
        data.forEach((element, index) => {
          element.itens.forEach((elementson, indexson)=>{
            itens.push({...elementson, FK_PED: element.PK_PED})
          })
        })
        const geraPkListPormiseItePedidos = await itens.map((element, index) => geraPk('PK_IPE').then(Data => ( { ...element, PK_IPE: Data[0].VALOR })))
        // console.log(itens)
        // console.log(data)
        return Promise.all(geraPkListPormiseItePedidos)
    }).then(data => {
        // console.log(data)
        itepedidos = data
        var update = {}
        return db.get('update').then(function(doc) {
              update = {
                _id: 'update',
                data:  doc.data,
                _rev: doc._rev
              }
            //   console.log('esse:', update)
              return update
        }).then(function(response) {
          return response
          // console.log('Update updated!')

        })
        
    }).then(async function(response) {
          // console.log('Read updated with new pks!')
          let update = response
          for (let icreated of create.data.clientes){
            delete icreated.CIDADE
            delete icreated.cidade
            delete icreated.id
            delete icreated.ID
            icreated.read = Number(icreated.READ) || 0
            console.log()
            let propscreated = removeAcento(JSON.stringify(Object.getOwnPropertyNames(icreated)))
            let valuescreated = removeAcento(JSON.stringify(Object.values(icreated)))
            let fields = propscreated.split('"').join("").split('[').join("").split(']').join("").split('CIDADE,').join("")
            let values = valuescreated.split('"').join("'").split('[').join("").split(']').join("").split(',,').join(",").split("''").join("NULL").split("''").join("'")
            fields = fields+",FK_VEN"
            let usuario = localStorage.getItem("macropecas")
            values = values+","+usuario
            // console.log(fields)
            // console.log(values)
            await newCreate('clientes',fields, values, 'PK_CLI')
            let update = response
            update.data.clientes.forEach(function (iupdated, idupdated) {
                if (icreated.read === iupdated.read){
                  update.data.clientes[idupdated]['PK_CLI']=icreated['PK_CLI']
                }
            })
            //   return db.put(newUpdate)
            // }).then(function(response) {
            //   console.log('Update updated!')
            
            // })
            // newCreate.data.clientes.splice(idcreate,1)
            // console.log(newCreate.data.clientes)
          }
          return update
      }).then(async function(response) {
              let update = response
            //   create.data.pedidos.forEach(async function (icreated, idcreate)
              for (let icreated of create.data.pedidos)  {
                delete icreated.itens
                delete icreated.ITENS
                delete icreated.RAZAO_SOCIAL
                delete icreated.NOMECPG
                delete icreated.ID
                delete icreated.id
                icreated.read = Number(icreated.READ) || 0
                if (icreated.FK_CLI === 0) {
                  let cli = create.data.clientes.filter((value)=>{return value.read === icreated.CLIREAD})
                  console.log(icreated.CLIREAD, cli[0])
                  icreated.FK_CLI = cli[0].PK_CLI
                  icreated.CLIREAD = []
                } else {
                  icreated.CLIREAD = []
                }
                // console.log(icreated.VALOR_CALCULADO)
                let dataped = icreated.DATA
                icreated.DATA = dateSql(dataped)
                let propscreated = removeAcento(JSON.stringify(Object.getOwnPropertyNames(icreated)))
                let valuescreated = removeAcento(JSON.stringify(Object.values(icreated)))
                let fields = propscreated.split('"').join("").split('[').join("").split(']').join("").split('itens,').join("").split('IMPORTADO').join("IMPORTACAO").split(',RAZAO_SOCIAL').join("").split(',NOMECPG').join("").split(',CLIREAD').join("")
                let values = valuescreated.split('"').join("'").split('[').join("").split(']').join("").split(',,').join(",").split(',,').join(",").split("''").join("null").split(',,').join(",").split("''").join("'")
                fields = fields+",FK_VEN"
                let usuario = localStorage.getItem("macropecas")
                values = values+","+usuario
                // console.log(fields)
                // console.log(values)
                console.log(fields)
                console.log(values)
                await newCreate('pedidos_venda',fields, values, 'PK_PED')
                console.log('TESTE')
                // db.get('update').then(function(doc) {
                //   let newUpdate = {
                //     _id: 'update',
                //     data:  doc.data,
                //     _rev: doc._rev
                //   }
                  if (typeof update.data.pedidos !== 'undefined'){
                    update.data.pedidos.forEach(function (iupdated, idupdated) { 
                        if (Number(icreated.read) === Number(iupdated.read)){
                          iupdated['PK_PED']=icreated['PK_PED']
                          iupdated['NUMWEB']=icreated['NUMWEB']
                          // console.log(icreated.PK_PED+' ** '+icreated.NUMWEB)
                          iupdated.itens.forEach(function (iupdatedson, idupdatedson) {
                            iupdatedson.FK_PED = icreated['PK_PED']
                          })
                        }
                    })
                  }
                }
            // console.log('********')
            return update
      }).then(async function(response) {
                console.log('Update updated!')
                let update = response
                console.log(itepedidos)
                for (let icreated of itepedidos)  {
                    delete icreated.DESCRICAOPRO
                    delete icreated.CODIGOPRO
                    delete icreated.OBS_PROMOCIONAL
                    delete icreated.TOTAL
                    delete icreated.ID
                    delete icreated.id
                    icreated.read = Number(icreated.READ) || 0
                    icreated.QUANTIDADE=Number(icreated.QUANTIDADE)
                    icreated.DESCONTO1=Number(icreated.DESCONTO1)
                    icreated.DESCONTO2=Number(icreated.DESCONTO2)
                    delete icreated.VALOR_IPI
                    let propscreated = removeAcento(JSON.stringify(Object.getOwnPropertyNames(icreated)))
                    let valuescreated = removeAcento(JSON.stringify(Object.values(icreated)))
                    let fields = propscreated.split('"').join("").split('[').join("").split(']').join("").split(',DESCRICAOPRO').join("").split(',CODIGOPRO').join("").split('CODIGOPRO,').join("").split(',VALOR_IPI').join("").split(',OBS_PROMOCIONAL').join("").split(',TOTAL').join("").split(',mostraModal').join("")
                    let values = valuescreated.split('"').join("'").split('[').join("").split(']').join("").split(',,').join(",").split(',,').join(",").split(",'%$#'").join("").split("'%$#',").join("").split(',true,').join("").split(',false,').join("").split("''").join("null").split(',,').join(",").split("''").join("'")
                    // console.log(fields)
                    // console.log(values)
                    await newCreate('itens_ped_venda',fields, values, 'PK_IPE')
                    let update = response
                    // db.get('update').then(function(doc) {
                    //   let newUpdate = {
                    //     _id: 'update',
                    //     data:  doc.data,
                    //     _rev: doc._rev
                    //   }
                    if (typeof update.data.pedidos !== 'undefined'){
                        for(let iupdated of update.data.pedidos){
                      // newUpdate.data.pedidos.forEach(function (iupdated, idupdated) {
                          if (Number(iupdated.PK_PED) === Number(icreated.FK_PED)){
                            for(let iupdatedson of iupdated.itens) {
                            // iupdated.itens.forEach(function (iupdatedson, idupdatedson) {
                              if (Number(iupdatedson.read) === Number(icreated.read)){
                                iupdatedson.PK_IPE = icreated.PK_IPE
                              }
                            }
                          // )
                          }
                      }
                      // )
                    }
                      // return db.put(newUpdate)
                    // }).then(function(response) {
                    //   console.log('Update updated!')
                      
                    // })
                    // itepedidos.splice(idcreate,1)
                    // console.log(newCreate.data.clientes)
                  }
                  return update
                // }).then(function(res) {
                       
                  
                // })
                // pedidos.splice(idcreate,1)
                // console.log(newCreate.data.clientes)
              // })

    }).then(async function(response) {
      await db.put(response)
      console.log('Create sended!')
      resolve()
      

    }).catch(function(err){
        console.log(err)
        resolve()

    })

  
  }) 
}


function updateToFirebird(callback) {
    return new Promise (async (resolve, reject) => {
        let update = {
            _id: 'update',
            data:  [],  
            _rev: 0
        }
        db.get('update').then(async function(doc) { 
            update.data = doc.data
            update._rev = doc._rev

            for (let iupdated of update.data.clientes)  {
                iupdated.read = Number(iupdated.READ) || 0
                delete iupdated.CIDADE
                delete iupdated.cidade
                delete iupdated.id
                delete iupdated.ID
                let propsupdated = removeAcento(JSON.stringify(Object.getOwnPropertyNames(iupdated)))
                let valuesupdated = removeAcento(JSON.stringify(Object.values(iupdated)))
                let fields = propsupdated.split('"').join("").split('[').join("").split(']').join("")
                let values = valuesupdated.split('"').join("'").split('[').join("").split(']').join("")
                // console.log(fields)
                // console.log(values)
                const xSplited = fields.split(',')
                const ySplited = values.split(',')
                //   let where = ''
                // console.log(xSplited)
                let fieldsnvalues = []
                fieldsnvalues = xSplited.map((x, i) => {
                    // if (x===nomepk){
                    //   where = x+'='+ySplited[i]
                    // } else if (x ==='itens') {
                    //   console.log('itens')
                    // } else if (ySplited[i] === 'null') {
                    //     console.log('erro - '+x+'='+ySplited[i]) 
                    // } else return fieldsnvalues[i]=x+'='+ySplited[i]
                    // return ''
                    if (x==='PK_CLI'){
                    //   where = x+'='+ySplited[i]
                    return ''
                    } else if (x ==='itens') {
                    console.log('itens')
                    return ''
                    } else return fieldsnvalues[i]=x+'='+ySplited[i]
                })
                fieldsnvalues = removeAcento(JSON.stringify(fieldsnvalues).split('"').join("").split('[').join("").split(']').join("").split("=null,").join("*").split("null,").join("").split("*").join("=null,"));
                await newUpdate('clientes',iupdated, 'PK_CLI', iupdated.PK_CLI)
            }

            for(let iupdated of update.data.pedidos)  {
                for (let iupdatedson of iupdated.itens) {
                    delete iupdatedson.DESCRICAOPRO
                    delete iupdatedson.CODIGOPRO
                    delete iupdatedson.OBS_PROMOCIONAL
                    delete iupdatedson.TOTAL
                    delete iupdatedson.id
                    delete iupdatedson.ID
                    delete iupdatedson.mostraModal
                    delete iupdatedson.MOSTRAMODAL
                    delete iupdatedson.VALOR_IPI
                    iupdatedson.read = Number(iupdatedson.READ) || 0
                    iupdatedson.FK_PED = iupdated.PK_PED
                    iupdatedson.QUANTIDADE=Number(iupdatedson.QUANTIDADE)
                    iupdatedson.DESCONTO1=Number(iupdatedson.DESCONTO1)
                    iupdatedson.DESCONTO2=Number(iupdatedson.DESCONTO2)
                    let propsupdatedson = removeAcento(JSON.stringify(Object.getOwnPropertyNames(iupdatedson)))
                    let valuesupdatedson = removeAcento(JSON.stringify(Object.values(iupdatedson)))
                    let fieldsson = propsupdatedson.split('"').join("").split('[').join("").split(']').join("").split(',DESCRICAOPRO').join("").split(',mostraModal').join("").split('CODIGOPRO,').join("").split(',id').join("").split(',VALOR_IPI').join("").split(',OBS_PROMOCIONAL').join("").split(',TOTAL').join("").split('"').join("")
                    let valuesson = valuesupdatedson.split('"').join("'").split('[').join("").split(']').join("").split(',,').join(",").split(',,').join(",").split(",'%$#'").join("").split("'%$#',").join("").split("''").join("null")
                    if (typeof iupdatedson.PK_IPE === 'undefined'){
                    await geraPk('PK_IPE').then(res => {
                        console.log(res)
                        fieldsson=fieldsson+',PK_IPE'
                        valuesson=valuesson+','+res[0].VALOR})
                    .then(async res =>{
                        console.log(fieldsson)
                        console.log(valuesson)
                        await newCreate('itens_ped_venda',fieldsson, valuesson, 'PK_IPE')  
                    }) 
                    } else {
                    const xSplitedson = fieldsson.split(',')
                    const ySplitedson = valuesson.split(',')
                    //   let whereson = ''
                    let fieldsnvaluesson = []
                    xSplitedson.forEach((xson, ison) => {
                        if (xson==='PK_IPE'){
                        //   whereson = xson+'='+ySplitedson[ison]
                        } else fieldsnvaluesson[ison]=xson+'='+ySplitedson[ison]
                    })
                    fieldsnvaluesson = removeAcento(JSON.stringify(fieldsnvaluesson).split('"').join("").split('[').join("").split(']').join("").split("=null,").join("*").split("null,").join("").split("*").join("=null,"));
                    await newUpdate('itens_ped_venda',fieldsnvaluesson, 'PK_IPE', iupdatedson.PK_IPE)
                    //   atualizaItem('itens_ped_venda',fieldsnvaluesson, whereson)
                    }
                }
                delete iupdated.itens
                delete iupdated.RAZAO_SOCIAL
                delete iupdated.NOMECPG
                delete iupdated.id
                delete iupdated.ID
                iupdated.read = Number(iupdated.READ) || 0
                let propsupdated = removeAcento(JSON.stringify(Object.getOwnPropertyNames(iupdated)))
                let valuesupdated = removeAcento(JSON.stringify(Object.values(iupdated)))
                let fields = propsupdated.split('"').join("").split('[').join("").split(']').join("").split('itens,').join("").split('IMPORTADO').join("IMPORTACAO").split(',RAZAO_SOCIAL').join("").split(',NOMECPG').join("").split('"').join("")
                let values = valuesupdated.split('"').join("'").split('[').join("").split(']').join("").split(',,').join(",").split(',,').join(",").split("''").join("null")

                const xSplited = fields.split(',')
                const ySplited = values.split(',')
                //   let where = ''
                // console.log(xSplited)
                let fieldsnvalues = []
                xSplited.forEach((x, i) => {
                    if (x==='PK_PED'){
                    //   where = x+'='+ySplited[i]
                    console.log('teste')
                    } else if (x==='DATA'){
                    fieldsnvalues[i]=x+'='+dateSql(ySplited[i].split("'").join(""), "'")
                    } else fieldsnvalues[i]=x+'='+ySplited[i]
                })
                fieldsnvalues = removeAcento(JSON.stringify(fieldsnvalues).split('"').join("").split('[').join("").split(']').join("").split("=null,").join("*").split("null,").join("").split("*").join("=null,"));
                await newUpdate('pedidos_venda',fieldsnvalues, 'PK_PED', iupdated.PK_PED)
                //   atualizaItem('pedidos_venda',fieldsnvalues, where)
                
            }

        }).then(function(response) {
            resolve()
            console.log('Update sended!')

        }).catch(function(err){
            resolve()
            console.log(err)
 
        })

        
    })

}



// function prepareCreate (tabela, itens, nomepk) {
//     return new Promise (resolve => {
//         let usuario = localStorage.getItem("macropecas")
//         let count = 0
//         console.log(tabela)
//         if (tabela === 'clientes') {
//             if (itens.length > 0) {
//                 for (let i of itens){
//                     delete i.CIDADE
//                     i.FK_VEN = usuario
                    
//                     geraPk(nomepk).then(Data => { 
//                         i[nomepk] = Data[0].VALOR 
//                         let fields = removeAcento(JSON.stringify(Object.getOwnPropertyNames(i)).split('"').join("").split('[').join("").split(']').join("")
//                         let values = removeAcento(JSON.stringify(Object.values(i)).split('"').join("'").split('[').join("").split(']').join("").split("''").join("null")
//                         newCreate('clientes', fields, values, nomepk)
//                         count+=1
//                         console.log(count, itens.length)
//                         if (count === itens.length) {
//                             console.log('resolved')
//                             resolve()
//                         }
//                     })
                    
//                 }
//             } else resolve()
//         } else if (tabela === 'pedidos') {
//             if (itens.length > 0) {
//                 for (let i of itens){
//                     delete i.RAZAO_SOCIAL
//                     delete i.NOMECPG
//                     delete i.IMPORTADO
//                     delete i.IMPORTACAO
//                     i.FK_VEN = usuario
//                     let itepeds = i.itens
//                     delete i.itens
//                     // if (i.FK_CLI === 0) {
                        
//                     //     console.log(icreated.CLIREAD, cli[0])
//                     //     i.FK_CLI = cli[0].PK_CLI
//                     //     delete i.CLIREAD
//                     // } else {
//                         delete i.CLIREAD
//                     // }
                    
//                     geraPk(nomepk).then(async Data => { 
//                         i[nomepk] = Data[0].VALOR 
//                         let fields = removeAcento(JSON.stringify(Object.getOwnPropertyNames(i)).split('"').join("").split('[').join("").split(']').join("")
//                         let values = removeAcento(JSON.stringify(Object.values(i)).split('"').join("'").split('[').join("").split(']').join("").split("''").join("null")
//                         newCreate('pedidos_venda', fields, values, nomepk)
//                         count+=1
//                         let itemcount = 0
//                         await asyncForEach(itepeds, async (itemped) => {
                            
//                             delete itemped.DESCRICAOPRO
//                             delete itemped.CODIGOPRO
//                             delete itemped.OBS_PROMOCIONAL
//                             delete itemped.TOTAL
//                             delete itemped.id
//                             delete itemped.VALOR_IPI
//                             itemped.QUANTIDADE=Number(itemped.QUANTIDADE)
//                             itemped.DESCONTO1=Number(itemped.DESCONTO1)
//                             itemped.DESCONTO2=Number(itemped.DESCONTO2)
//                             geraPk('PK_IPE').then(Data => { 
//                                 itemped.PK_IPE = Data[0].VALOR
//                                 itemped.FK_PED = i[nomepk]
//                                 let itemfields = removeAcento(JSON.stringify(Object.getOwnPropertyNames(itemped)).split('"').join("").split('[').join("").split(']').join("")
//                                 let itemvalues = removeAcento(JSON.stringify(Object.values(itemped)).split('"').join("'").split('[').join("").split(']').join("").split("''").join("null")
//                                 newCreate('itens_ped_venda', itemfields, itemvalues, 'PK_IPE')
//                                 itemcount += 1
//                             })
//                         })
//                         if ((count === itens.length) && (itemcount === itepeds.length)) {
//                             resolve()
//                         }
//                     })
                    
                    
//                 }
//             } else resolve()
//         } else if (tabela === 'itepedidos') {
//             if (itens.length > 0) {
//                 for (let i of itens){
//                     delete i.RAZAO_SOCIAL
//                     delete i.NOMECPG
//                     delete i.IMPORTADO
//                     delete i.IMPORTACAO
//                     i.FK_VEN = usuario
//                     let itepeds = i.itens
//                     delete i.itens
                    
//                     geraPk(nomepk).then(Data => { 
//                         i[nomepk] = Data[0].VALOR 
//                         let fields = removeAcento(JSON.stringify(Object.getOwnPropertyNames(i)).split('"').join("").split('[').join("").split(']').join("")
//                         let values = removeAcento(JSON.stringify(Object.values(i)).split('"').join("'").split('[').join("").split(']').join("").split("''").join("null")
//                         newCreate('itens_ped_venda', fields, values, nomepk)
//                         count+=1
//                         if (count === itens.length) {
//                             resolve()
//                         }
//                     })
                    
//                 }
//             } else resolve()
//         } 
//     })
// }

export async function writeLog() {
    return new Promise (async (resolve, reject) => {
        try{
            await deleteToFirebird().then(async (res) => {
            await createToFirebird().then(async (res) => {    
                    await updateToFirebird().then(async (res) => { 
                        db.get('log').then(function(doc) {
                            let newLog = {
                                    _id: 'log',
                                    data:  doc.data,
                                    _rev: doc._rev
                            }
                            console.log(newLog)
                            resolve()
                        })
                    })
                })
            })
        } catch (err) {
            reject(err) ;  throw err
        }
    })
}


export function newDelete(tabela, nomepk, valorpk){
    return new Promise ((resolve, reject) => {
        let sql = 'DELETE FROM '+tabela+' WHERE '+nomepk+' = '+valorpk;
        db.get('log').then(function(doc) {
            let newLog = {
                    _id: 'log',
                    data:  doc.data,
                    _rev: doc._rev
            }

            if (tabela === 'pedidos_venda') {
                newLog.data.qty.delete += 1
                newLog.data.delete.push('DELETE FROM ITENS_PED_VENDA WHERE FK_PED = '+valorpk)
            }
            newLog.data.qty.delete += 1
            newLog.data.delete.push(sql)
            return db.put(newLog)

            
        }).then(function(response) {
            console.log('done:', response)
            resolve(response)
        }).catch(function (err) {
            console.log(err)
            if (err.name === 'not_found') {
                let log = {
                    _id: 'log',
                    data: {
                        qty: {
                            create: 0,
                            update: 0,
                            delete: 1
                        },
                        create: [],
                        update: [],
                        delete: []
                    }
                }
                log.data.delete.push(sql)
                createTable(log, (res) => {
                    resolve(res)
                })
            } else {
                resolve(err)
            }
        })
    })
}



export async function newCreate(tabela, fields, values, nomepk){
    return new Promise (async (resolve, reject) => {
        let sql = 'INSERT INTO '+tabela+' ('+fields+ ') values ('+values+')';
        // let promises = [];
        console.log('Teste1')
        await db.get('log').then(async function(doc) {
            let newLog = {
                    _id: 'log',
                    data:  doc.data,
                    _rev: doc._rev
            }
            newLog.data.qty.create += 1
            await newLog.data.create.push(sql)
            console.log(newLog.data)
            return await db.put(newLog)
        }).then(function(response) {
            console.log('done:', response)
        }).catch(async function (err) {
            console.log(err)
            console.log(sql)
            if (err.name === 'not_found') {
                let log = {
                    _id: 'log',
                    data: {
                        qty: {
                            create: 1,
                            update: 0,
                            delete: 0
                        },
                        create: [],
                        update: [],
                        delete: []
                    }
                }
                await log.data.create.push(sql)
                createTable(log, (res) => {
                    
                })
            } else {
                // resolve(err)
            }
        })
        resolve()
        
    })
}




export function newUpdate(tabela, fieldsnvalues, nomepk, valorpk){
    return new Promise ((resolve, reject) => {
        // let fields = removeAcento(JSON.stringify(Object.getOwnPropertyNames(item))
        // let values = removeAcento(JSON.stringify(Object.values(item))
        // let update = []
        // fields = fields.split('"').join('').split('[').join('').split(']').join('').split(',')
        // values = values.split('[').join('').split(']').join('').split(',')
        // console.log(fields)
        // console.log(values)
        // fields.map((element, index) => {
        //     return update[index]= element+'='+values[index]
        // })
        // update = removeAcento(JSON.stringify(update).split('"').join("").split('[').join("").split(']').join("").split('\\').join("'")
        let update = fieldsnvalues
        let sql = 'UPDATE '+tabela+' SET '+update+' WHERE '+nomepk+'='+valorpk
        db.get('log').then(function(doc) {
            let newLog = {
                    _id: 'log',
                    data:  doc.data,
                    _rev: doc._rev
            }
            newLog.data.qty.update += 1
            newLog.data.update.push(sql)
            console.log(newLog.data)
            return db.put(newLog)
        }).then(function(response) {
            console.log('done:', response)
            resolve(response)
        }).catch(function (err) {
            console.log(err)
            if (err.name === 'not_found') {
                let log = {
                    _id: 'log',
                    data: {
                        qty: {
                            create: 0,
                            update: 1,
                            delete: 0
                        },
                        create: [],
                        update: [],
                        delete: []
                    }
                }
                log.data.update.push(sql)
                createTable(log, (res) => {
                    resolve(res)
                })
            } else {
                resolve(err)
            }
        })
    })
}




export function deleteToFirebird(callback){
    return new Promise (async (resolve, reject) => {
    console.log('entrou no delete')
    let deleted = {
            _id: 'delete',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            },    
            _rev: 0
        }
        let pedidos = []
        let itepedidos = []
        db.get('delete').then(async function(doc) { 
            // console.log('chamou delete to firebird')
            deleted._rev = doc._rev
            pedidos = doc.data.pedidos || []
            itepedidos = doc.data.itepedidos || []
            //   const deletes = []
            for (let element of pedidos) {
                if (typeof element.PK_PED !== 'undefined'){
                // element.itens.forEach((element, index) => {
                //   deleteItem('itepedidos', 'PK_IPE', element.PK_IPE)
                // })
                await newDelete('pedidos_venda', 'PK_PED', element.PK_PED)
                
                }
            }
            console.log(itepedidos)
            for (let element of itepedidos) {
                if (typeof element.PK_IPE !== 'undefined'){
                await newDelete('itens_ped_venda', 'PK_IPE', element.PK_IPE)
                }
            }
            //   Promise.all(deletes).then(res => {
            //     // console.log(res)
            //   })
            deleted.data.pedidos = pedidos
            deleted.data.itepedidos = itepedidos
            console.log(deleted)
            return db.put(deleted)
        }).then(function(response) {
            console.log('Delete sended!')
            resolve()

        }).catch(function(err){
            console.log(err)
            resolve()

        })
    })



}

async function cleanDb(){
    return new Promise (async (resolve, reject)=>{
        let create = {
            _id: 'create',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            }      
        }
        await db.get('create').then(function(doc) {
        let newCreate = {
            _id: 'create',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            },    
            _rev: doc._rev
        } 

            return db.put(newCreate)
        }).then(function(response) {
        console.log('Create updated!')
        }).catch(function (err) {
        if (err.name === 'not_found') {
            db.put(create).then(function (response) {
                console.log('Create created!')
            }).catch(function (err) {
            console.log(err);
            });
        }
        });

        let update = {
            _id: 'update',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            }     
        }
        await db.get('update').then(function(doc) {
        let newUpdate = {
            _id: 'update',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            },  
            _rev: doc._rev
        } 

            return db.put(newUpdate)
        }).then(function(response) {
        console.log('Update updated!')
        }).catch(function (err) {
        if (err.name === 'not_found') {
            db.put(update).then(function (response) {
                console.log('Update created!')
            }).catch(function (err) {
            console.log(err);
            });
        }
        });


        let deleted = {
            _id: 'delete',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            }   
        }
        await db.get('delete').then(function(doc) {
        let newDeleted = {
            _id: 'delete',
            data: {
            clientes: [],
            pedidos: [],
            produtos: [],
            st_icms: [],
            cond_pag: [],
            cidades: [],
            descontolog: [],
            itepedidos:[]
            },  
            _rev: doc._rev
        } 

            return db.put(newDeleted)
        }).then(function(response) {
        console.log('Delete updated!')
        resolve()
        }).catch(function (err) {
        if (err.name === 'not_found') {
            db.put(deleted).then(function (response) {
                console.log('Delete created!')
                resolve()
            }).catch(function (err) {
            console.log(err);
            });
        }
        }); 

        
    })
}


export function sync(){
    return new Promise ((resolve, reject) => {
        try {
            let withoutSend = false
            console.log("*******************************")
            console.log('Preparing: writing log!')
            // alert('Preparing: writing log!')
            db.get('log').then(function(doc) {
                let newLog = {
                        _id: 'log',
                        data:  doc.data,
                        _rev: doc._rev
                }
                newLog.data.qty.create = 0
                newLog.data.qty.update = 0
                newLog.data.qty.delete = 0
                newLog.data.create = []
                newLog.data.update = []
                newLog.data.delete = []
                console.log(newLog.data)
                return db.put(newLog)
            }).then(function(response) {
                console.log('Log cleaned')
                writeLog().then((res)=>{
                    console.log('Log finished!')
                    console.log('Step 1 - Start Sync: started!')
                    // alert('Step 1 - Start Sync: started!')
                    startSync().then(async (res) => {
                        console.log(res)
                        let arquivo = res
                        console.log('Step 1 - Start Sync: done!')
                        console.log('Step 2 - Identify SQLs: started!')
                        // alert('Step 2 - Identify SQLs: started!')
                        await identifySql(arquivo).then(async (res) => {
                            if ((Number(res.create) + Number(res.delete) + Number(res.update)) === 0) {
                                withoutSend = true
                                console.log('No data to be sended. Ignoring steps 3 and 4.')
                            } else console.log(res)
                            
                            console.log('Step 2 - Identify SQLs: done!')
                            console.log('Step 3 - Send SQLs: started!')
                            // alert('Step 3 - Send SQLs: started!')
                            await sendSql(withoutSend, arquivo).then(async (res) => {
                                console.log('Step 3 - Send SQLs: done!')
                                console.log('Step 4 - Start Transaction: started!')
                                // alert('Step 4 - Start Transaction: started!')
                                await startTransaction(withoutSend, arquivo).then((res) => {
                                    console.log(res)
                                    if (res === 'Commited!') {
                                        db.get('log').then(function(doc) {
                                            let newLog = {
                                                    _id: 'log',
                                                    data:  doc.data,
                                                    _rev: doc._rev
                                            }
                                            newLog.data.qty.create = 0
                                            newLog.data.qty.update = 0
                                            newLog.data.qty.delete = 0
                                            newLog.data.create = []
                                            newLog.data.update = []
                                            newLog.data.delete = []
                                            console.log(newLog.data)
                                            return db.put(newLog)
                                        }).then(async function(response) {
                                                                                
                                            console.log('Log cleaned')
                                            await cleanDb().then(async (res)=>{
                                                console.log('Create, Update and delete cleaned')
                                                console.log('Step 4 - Start Transaction: done!')
                                                console.log('Step 5 - Get Data: started!')
                                                // alert('Step 5 - Get Data: started!')
                                                await getData().then((res) => {
                                                    console.log('Step 5 - Get Data: done!')
                                                    console.log("*******************************")
                                                    resolve('OK')
                                                }).catch(function (err) {
                                                    console.log(err)
                                                    console.log('Step 5 - Get Data: error!')
                                                    // alert('Houve um erro na sincronização. Tente novamente.');
                                                    reject('ERROR')
                                                })
                                            }).catch(function (err) {
                                                console.log(err)
                                                console.log('Step 5 - Get Data: error!')
                                                console.log("*******************************")
                                                // alert('Houve um erro na sincronização. Tente novamente.');
                                                reject('ERROR')
                                            })
                                        }).catch(function (err) {
                                            console.log(err)
                                            console.log('Step 4 - Start Transaction: error!')
                                            console.log("*******************************")
                                            // alert('Houve um erro na sincronização. Tente novamente.');
                                            reject('ERROR')
                                        })
                                    } else if (res === 'Ignored') {
                                        console.log('Step 4 - Start Transaction: done!')
                                        console.log('Step 5 - Get Data: started!')
                                        getData().then((res) => {
                                            console.log('Step 5 - Get Data: done!')
                                            console.log("*******************************")
                                            resolve('OK')
                                        }).catch(function (err) {
                                            console.log(err)
                                            console.log('Step 5 - Get Data: error!')
                                            console.log("*******************************")
                                            // alert('Houve um erro na sincronização. Tente novamente.');
                                            reject('ERROR')
                                        })
                                    } else { 
                                        console.log('Step 4 - Start Transaction: error!')
                                        console.log("*******************************")
                                        // alert('Houve um erro na sincronização. Tente novamente.');
                                        reject('ERROR')
                                    }
                                    
                                }).catch(function (err) {
                                    console.log(err)
                                    console.log('Step 4 - Start Transaction: error!')
                                    console.log("*******************************")
                                    // alert('Houve um erro na sincronização. Tente novamente.');
                                    reject('ERROR')
                                })
                            }).catch(function (err) {
                                console.log(err)
                                console.log('Step 3 - Send SQLs: error!')
                                console.log("*******************************")
                                // alert('Houve um erro na sincronização. Tente novamente.');
                                reject('ERROR')
                            })
                        }).catch(function (err) {
                            console.log(err)
                            console.log('Step 2 - Identify SQLs: error!')
                            console.log("*******************************")
                            // alert('Houve um erro na sincronização. Tente novamente.');
                            reject('ERROR')
                        })
                    }).catch(function (err) {
                        console.log(err)
                        console.log('Step 1 - Start Sync: error!')
                        console.log("*******************************")
                        // alert('Houve um erro na sincronização. Tente novamente.');
                        reject('ERROR')
                    })
                }).catch(function (err) {
                    console.log(err)
                    // alert('Houve um erro na sincronização. Tente novamente.');
                    reject('ERROR')
                })
            }).catch(function (err) {
                console.log(err)
                let newLog = {
                        _id: 'log',
                        data:  {
                            qty: {
                                create : 0,
                                update : 0,
                                delete : 0
                            },
                            create : [],
                            update : [],
                            delete : []
                        },
                        _rev: 0
                }
                console.log(newLog.data)
                db.put(newLog).then((res)=>{
                    console.log('First Sync')
                    console.log('Empty Log generated')
                    cleanDb().then((res)=>{
                        console.log('Empty Create, Update and delete generated!')
                        console.log('Step 1 - Get Data: started!')
                        getData().then((res) => {
                            console.log('Step 1 - Get Data: done!')
                            console.log("*******************************")
                            resolve('OK')
                        }).catch(function (err) {
                            console.log(err)
                            console.log('Step1 - Get Data: error!')
                            // alert('Houve um erro na sincronização. Tente novamente.');
                            reject('ERROR')
                        })
                    }).catch((err)=>{
                        console.log(err)
                        reject('ERROR')
                    })

                }).catch((err)=>{
                    console.log(err)
                    reject('ERROR')
                })

            }).catch((err)=>{
                console.log(err)
                reject('ERROR')
            })

            
        } catch (err) {
            reject(err) ;  throw err
        }
    })
    
}

export function teste2(tabela, fields, nomepk, valorpk){
    newUpdate(tabela, fields, nomepk, valorpk)
}


function startSync(){
    return new Promise ((resolve, reject) => {
        try {
            let usuario = localStorage.getItem("macropecas")
            fetch(server+'/startSync?user='+usuario+'&versao='+versao).then(r => r.json()).then(r => resolve(r)).catch(err => {reject(err) ;  throw err})
        } catch (err) {
            reject(err) ;  throw err
        }
    })
}

function identifySql(arquivo){
    return new Promise ((resolve, reject) => {
        try {
            let usuario = localStorage.getItem("macropecas")
            db.get('log').then((doc) => {
                fetch(server+'/identifySync?user='+usuario+'&create='+doc.data.qty.create+'&update='+doc.data.qty.update+'&delete='+doc.data.qty.delete+'&arquivo='+arquivo).then(r => r.json()).then(r => resolve(r)) 
            })
        } catch (err) {
            reject(err);  throw err
        }
               
    })
}

async function sendSql(withoutSend, arquivo){
    return new Promise ((resolve, reject) => {
        try {
            if (!withoutSend){
                let usuario = localStorage.getItem("macropecas")
                db.get('log').then((doc) => {
                    console.log(doc.data)
                    sendType(doc.data.create, usuario, 'create', arquivo).then((res) => {
                        sendType(doc.data.update, usuario, 'update', arquivo).then((res) => {
                            sendType(doc.data.delete, usuario, 'delete', arquivo).then((res) => {
                                console.log('terminou')
                                resolve()
                            })
                        })
                    })
                })     
            } else resolve('Ignored')
        } catch (err) {
            reject(err) ;  throw err
        }
    })
}


async function sendType(data, usuario, type, arquivo){
    return new Promise (async (resolve, reject) => {
        try {
            await asyncForEach(data, async (item) => {
                await sendItem(item,usuario, type, arquivo)
            })
            resolve()
        } catch (err) {
            reject(err) ;  throw err
        }
    })
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sendItem(item, usuario, type, arquivo, callback){
    return new Promise (async (resolve, reject) => {
        try {
            item = decodeURIComponent(item)
            await fetch(server+'/sendSQL?user='+usuario+'&type='+type+'&sql='+item+'&arquivo='+arquivo).then(r => r.json()).then(r => {
                console.log(r)
                resolve(r)
            }).catch(err => {reject(err) ;  throw err})
        } catch (err) {
            reject(err) ;  throw err
        }
    })

}


function startTransaction (withoutSend, arquivo){
    return new Promise (async (resolve, reject) => {
        if (!withoutSend) {
            let usuario = localStorage.getItem("macropecas")
            await fetch(server+'/startTransaction?user='+usuario+'&arquivo='+arquivo).then(r => r.json()).then(r => {
                resolve(r)
            }).catch(err => {reject(err) ;  throw err})
        } else resolve('Ignored')
        
    })

}

function getData(){
    return new Promise (async (resolve, reject) => {
        try {
            let user = localStorage.getItem("macropecas")
            let pegaPedidos = []
            fetch(server+'/pedidos/'+user).then(ped => ped.json()).then(ped => {
                ped.forEach(function(pedido, idpedido){
                    ped[idpedido].itens=[];
                    fetch(server+'/itepedidos/'+pedido.PK_PED).then(r => r.json()).then(r => {            
                    ped[idpedido].itens=r
                    ped[idpedido].itens.forEach(function (element, index)  {
                        ped[idpedido].itens[index].mostraModal = false
                    })
                    })
                })
                pegaPedidos = ped
            }).then(ped => {
            // alert('Pedidos e itepedidos ok!')
            fetch(server+'/sticms').then(st => st.json()).then(st => {
                const stPromises = []
                let nSt = st[0].COUNT
                let xSt = 0
                do {
                stPromises.push(
                    fetch(`${server}/sticms?first=5000&skip=${xSt}`).then(res => res.json())
                )
                xSt = xSt + 5000;

                } while (nSt > xSt)

                Promise.all(stPromises).then(res => {
                let sticms = []
                res.forEach((element, id)=>{
                    sticms = sticms.concat(element)
                })
            // alert('st!')
                fetch(server+'/produtos').then(pro => pro.json()).then(pro => {
                    const productsPromises = []
                    let nPro = pro[0].COUNT
                    let xPro = 0
                    do {
                        productsPromises.push(
                        fetch(`${server}/produtos?first=5000&skip=${xPro}`).then(res => res.json())
                        )
                        xPro = xPro + 5000
                    } while (nPro > xPro)

                    Promise.all(productsPromises).then(res => {
                        let prod = []
                        res.forEach((element, id)=>{
                        prod = prod.concat(element)
                        })
                        fetch(server+'/clientes/'+user).then(r => r.json()).then(r => {
                        // alert('Clientes ok!')
                        fetch(server+'/cpg').then(rcpg => rcpg.json()).then(rcpg => {
                            // alert('Cpg ok!')
                            fetch(server+'/cidades').then(cid => cid.json()).then(cid => {
                            // alert('Cidades ok!')
                            fetch(server+'/descontolog').then(desc => desc.json()).then(desc => {  
                                // alert('Desconto Log ok!')
                                r.forEach(function (element, index)  {
                                if ( Number(element.FK_CID) > 0 ) {
                                    let pegaCidade = cid.filter((value) => { return value.PK_CID === element.FK_CID})
                                    element.CIDADE = pegaCidade[0].NOMECIDADE+' ('+pegaCidade[0].UF+')'
                                }
                                })



                                let read = {
                                _id: 'read',
                                data: {
                                    clientes: r,
                                    pedidos: pegaPedidos,
                                    produtos: prod,
                                    st_icms: sticms,
                                    cond_pag: rcpg,
                                    cidades: cid,
                                    descontolog: desc
                                }     
                                }

                                db.get('read').then(function(doc) {
                                let newRead = {
                                    _id: 'read',
                                    data:  read.data,
                                    _rev: doc._rev
                                }
                                return db.put(newRead);
                                }).then(function(response) {
                                    
                                console.log('Read updated!')
                                // alert('Sincronizado!')
                                resolve(response)
                                }).catch(function (err) {
                                if (err.name === 'not_found') {
                                    db.put(read).then(function (response) {
                                        console.log('Read created!')
                                        // alert('Sincronizado!')
                                        resolve(response)
                                    }).catch(function (err) {
                                    console.log(err);
                                    });
                                }
                                });
                            }).catch(err => {reject(err) ;  throw err})
                            }).catch(err => {reject(err) ;  throw err})
                        }).catch(err => {reject(err) ;  throw err})
                        }).catch(err => {reject(err) ;  throw err})
                    }).catch(err => {reject(err) ;  throw err})
                    }).catch(err => {reject(err) ;  throw err})
                }).catch(err => {reject(err) ;  throw err})
                }).catch(err => {reject(err) ;  throw err})
            }).catch(err => {reject(err) ;  throw err})
        } catch (err) {
            reject(err) ;  throw err
        }
    })
}






