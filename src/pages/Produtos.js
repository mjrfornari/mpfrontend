import React from "react";
import Clock from 'react-live-clock';
import { Redirect } from 'react-router-dom';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import SvgIcon from 'react-icons-kit';
import { ic_account_box } from 'react-icons-kit/md/ic_account_box';
import { ic_home } from 'react-icons-kit/md/ic_home'
import { ic_add_shopping_cart } from 'react-icons-kit/md/ic_add_shopping_cart';
import { ic_exit_to_app } from 'react-icons-kit/md/ic_exit_to_app'
import {ic_build} from 'react-icons-kit/md/ic_build'
import {ic_settings} from 'react-icons-kit/md/ic_settings'
import {ListGroup, ListGroupItem, Pagination} from 'react-bootstrap'
// import PouchDB from "pouchdb"
import { readTable, deleteData, zeraNull, garanteDate, date2str, pegaQtdOrcamento } from "./Utils";
import {ic_keyboard_arrow_left} from 'react-icons-kit/md/ic_keyboard_arrow_left'
import {ic_keyboard_arrow_right} from 'react-icons-kit/md/ic_keyboard_arrow_right'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'







// const db = new PouchDB('macropecas')





class Example extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            produtos  : [],
            show: false,
            filter:  {
                CODIGO_REPRESENTADA: '',
                NOME_REPRESENTADA: ''
            },
            filtered: [],
            detailed: false,
            qtd: {},
            iddetailed: 0,
            op: 'r',
            page: 1,
            inputPage: 1,
            maxPages: 1
        };
        this.show = false;
        this.handleRefresh = this.handleRefresh.bind(this);
        this.createItems = this.createItems.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleExcluir = this.handleExcluir.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.hideShow = this.hideShow.bind(this);
        this.handleBar = this.handleBar.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.appBar = this.appBar.bind(this);
        this.setPage = this.setPage.bind(this);
        this.calcPages = this.calcPages.bind(this);
        this.masterDetail = this.masterDetail.bind(this)
        this.ordenar = this.ordenar.bind(this)
        this.paginacao = this.paginacao.bind(this)

    }

    masterDetail(id){
        if (id === this.state.iddetailed){
            this.setState({detailed: !(this.state.detailed)})
        } else {
            this.setState({detailed: true, iddetailed: id})
        }
    }

    componentDidMount(){
        let nOrcs = {}
        pegaQtdOrcamento().then(res => {
            nOrcs = res
        })
        readTable(Data => {this.setState({produtos: Data.data.produtos, filtered: [], qtd: nOrcs})
            let restoreFilter = sessionStorage.getItem("macropFilter");
            if ((restoreFilter !== '' && restoreFilter !== null) && typeof restoreFilter !== 'undefined') {
                let restore = JSON.parse(restoreFilter)
                console.log(restore)
                if (restore.tela === 'produtos'){
                    this.setState({filter: restore.filtro})
                    this.applyFilter();
                } else {sessionStorage.removeItem('macropFilter')}
            }      
        })      
    }



    paginacao(){
        if (this.state.maxPages>1){
            // return (
            //     <Pagination>
            //         <button className="FormField__Pagination__First" onClick={ event => this.setPage(event,1,0)}>{'<<'}</button>
            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.page,-1)}>{'<'}</button>
            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,1,0)}>1</button>
            //         <button className="FormField__Pagination">...</button>

            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.page,-1)}>{this.prevPage()}</button>
            //         <button className="FormField__Pagination__Page">{this.state.page}</button>
            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.page,1)}>{this.nextPage()}</button>

            //         <button className="FormField__Pagination">...</button>
            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.maxPages,0)}>{this.state.maxPages}</button>
            //         <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.page,1)}>{'>'}</button>
            //         <button className="FormField__Pagination__Last" onClick={event => this.setPage(event,this.state.maxPages,0)}>{'>>'}</button>
            //     </Pagination>
            // )
            return (
                <Pagination>
                    <button className="FormField__Pagination__First" onClick={event => this.setPage(event,this.state.page,-1)}>{'◀'}</button>
                    <button className="FormField__Pagination" onClick={event => this.setPage(event,1,0)}>1</button>

                    <div className="FormField__Pagination__OutInput">
                        <input type="text" className="FormField__Pagination__Input" value={this.state.inputPage} onChange={event => this.setPage(event,1,0)}></input> 
                    </div>

                    <button className="FormField__Pagination" onClick={event => this.setPage(event,this.state.maxPages,0)}>{this.state.maxPages}</button>
                    <button className="FormField__Pagination__Last" onClick={event => this.setPage(event,this.state.page,1)}>{'▶'}</button>
                </Pagination>
            )

        } else {
            return (<div><br/><div></div></div>)
        }
    }
  
    createItems(item, id){
        if ((id <= (this.state.page*20)-1) && (id >= (this.state.page*20)-20)){
            if (this.state.detailed === true){
                        if (this.state.iddetailed === id){
                            return   (
                                <ListGroupItem href="#" key={id} header={'Código: '+item.CODIGO_REPRESENTADA} className="FormField__Grid" onClick={() => {this.masterDetail(id)}}>
                                    Descrição: {item.NOME_REPRESENTADA}<br/>
                                    NCM: {item.CLASSIFICACAO_FISCAL}<br/>
                                    EAN: {item.CODIGO_BARRAS}<br/>
                                    IPI: {zeraNull(item.IPI)+'%'}<br/>

                                    Preço Lista:<br/>   
                                    <li className='box'>
                                        PR: {'R$ '+zeraNull(item.PRECO_VENDA_LISTA)}<br/>
                                        R1: {'R$ '+zeraNull(item.PRECO_REGIAO_1)}<br/>
                                        R2: {'R$ '+zeraNull(item.PRECO_REGIAO_2)}<br/>
                                        R3: {'R$ '+zeraNull(item.PRECO_REGIAO_3)}<br/>
                                        R4: {'R$ '+zeraNull(item.PRECO_REGIAO_4)}<br/>
                                    </li>


                                    Preço Promocional:<br/>
                                    <li className='box'>
                                        PR: {'R$ '+zeraNull(item.PRECO_VENDA_PROMO)}<br/>
                                        R1: {'R$ '+zeraNull(item.PRECO_PROM_REGIAO_1)}<br/>
                                        R2: {'R$ '+zeraNull(item.PRECO_PROM_REGIAO_2)}<br/>
                                        R3: {'R$ '+zeraNull(item.PRECO_PROM_REGIAO_3)}<br/>
                                        R4: {'R$ '+zeraNull(item.PRECO_PROM_REGIAO_4)}<br/>
                                        Desconto: {zeraNull(item.PERC_DESC_PROMO)+'%'}<br/>
                                        Validade: {garanteDate(item.DATA_VALID_PROMO)}<br/>
                                        Obs Promocional: {item.OBS_PROMOCIONAL}
                                    </li>

                                    <li className='box'>
                                        Última atualização de preço: {garanteDate(item.DATA_ATUALIZACAO_PRECOS)}<br/>                                         
                                    </li>
                                </ListGroupItem>
                            )
                        } else {
                            return (
                                <ListGroupItem href="#" key={id} header={'Código: '+item.CODIGO_REPRESENTADA}  className="FormField__Grid" onClick={() => {this.masterDetail(id)}}>
                                    Descrição: {item.NOME_REPRESENTADA}<br/>
                                </ListGroupItem>
                            )
                        }
                    } else {
                        return (
                            <ListGroupItem href="#" key={id} header={'Código: '+item.CODIGO_REPRESENTADA}  className="FormField__Grid" onClick={() => {this.masterDetail(id)}}>
                                Descrição: {item.NOME_REPRESENTADA}<br/>
                            </ListGroupItem>
                        )
                    }
        }
    }





    handleBar(e){
        e.preventDefault()
        let showBar = this.state.show
        this.setState({show: !(showBar)})
    }

    appBar(mostra){
        if (mostra){
            return(
                <div className='App__Aside'>
                        <div>   
                            <SideNav highlightColor='var(--cor-letra)' highlightBgColor='var(--cor-menu)' defaultSelected='produtos'
                                        onItemSelection={ (id, parent) => {
                                            if (id==='exit'){  
                                                localStorage.setItem("logou", false);    
                                                this.props.history.push('/macropecas/')
                                            } else {this.props.history.push('/macropecas/'+id)
                            }}}>                      
                                <Nav id='home'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_home}/></NavIcon>    
                                    <NavText className='BarText'> Página Inicial </NavText>
                                </Nav>
                                <Nav id='clientes'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_account_box}/></NavIcon>    
                                    <NavText className='BarText'> Clientes </NavText>
                                </Nav>
                                <Nav id='produtos'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_build}/></NavIcon>
                                    <NavText className='BarText'> Produtos </NavText>
                                </Nav>
                                <Nav id='pedidos'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_add_shopping_cart}/></NavIcon>
                                    <NavText className='BarText'> Pedidos </NavText>
                                </Nav>
                                <Nav id='sync'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_settings}/></NavIcon>
                                    <NavText className='BarText'> Sistema </NavText>
                                </Nav>
                                <Nav id='exit'>
                                    <NavIcon className='BarIcon'><SvgIcon size={30} icon={ic_exit_to_app}/></NavIcon>
                                    <NavText className='BarText'> Sair </NavText>
                                </Nav>        
                            </SideNav>
                        </div>
                        </div>
            ) 
        } else {
            return(
                <div className='App__Aside__Hide'>
                </div> 
            )
        }
    }


    hideShow(){
        let show = this.state.show
        if (show) {        
            return (<button className="FormField__Button__HideShow" onClick={this.handleBar}><SvgIcon className='FormField__Icon__ShowHide' size={32} icon={ic_keyboard_arrow_left}/></button>)
        } else {
            
            return (<button className="FormField__Button__HideShow" onClick={this.handleBar}><SvgIcon className='FormField__Icon__ShowHide' size={32} icon={ic_keyboard_arrow_right}/></button>)
        }
    }

    handleExcluir(e) {
        e.preventDefault()
        let table = this.state.produtos
        // console.log(this.state.clientes[e.target.id])
        let result = window.confirm('Confirma a exclusão de "'+table[e.target.id].RAZAO_SOCIAL.trim()+'"?')
        if (result) {
            let removed = table.splice(e.target.id, 1)
            this.setState({produtos: table})
            deleteData('produtos',removed, e.target.id)
        }
    }


    handleChange(e){
        e.preventDefault()
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name
        let reg = this.state.filter
        reg[name] = value
        this.setState({
                    filter : reg
        })
        
    }
    

    handleRefresh(e){
        e.preventDefault()
        this.applyFilter();
    }


    applyFilter(){
        let dados = this.state.produtos
        let filtro = this.state.filter
        let restoreFilter = {tela: 'produtos', filtro: filtro}
        sessionStorage.setItem('macropFilter', JSON.stringify(restoreFilter))
        let filtrados = []
        dados.forEach(element => {
            // if (JSON.stringify(element.RAZAO_SOCIAL).toUpperCase().includes(filtro.RAZAO_SOCIAL.toUpperCase())){
            //     filtrados.push(element)
            // }
            if (JSON.stringify(element.CODIGO_REPRESENTADA).toUpperCase().includes(filtro.CODIGO_REPRESENTADA.toUpperCase()) && JSON.stringify(element.NOME_REPRESENTADA).toUpperCase().includes(filtro.NOME_REPRESENTADA.toUpperCase())){
                filtrados.push(element)
            }


        });
        this.calcPages(Object.keys(filtrados).length)
        this.setState({filtered: filtrados}) 
    }

    handleClean(e){
        // let dados = this.state.produtos
        let filtro = {
            CODIGO_REPRESENTADA: '',
            NOME_REPRESENTADA: ''
        }
        let filtrados = []
        sessionStorage.removeItem('macropFilter')
        this.setState({filtered: filtrados, filter: filtro, page:1, maxPages: 1}) 
    }

    setPage(e,setar, add){
        e.preventDefault();
        console.log(e.target.type)
        if (e.target.type === 'submit'){
            let gotoPage = (setar+add)
            if (gotoPage > this.state.maxPages){
                gotoPage = this.state.maxPages
            } else if (gotoPage < 1) {
                gotoPage = 1
            }
            this.setState({page: gotoPage, inputPage: gotoPage})
        } else {
                let pg = e.target.value
                if (pg !== '') {
                    if (pg > this.state.maxPages || pg < 1) {
                        alert('Página não encontrada')
                    } else {
                        this.setState({page: Number(pg), inputPage: Number(pg)})
                    }
                } else {this.setState({inputPage: Number(pg)})}
        }
    }
    
    calcPages(registros){
        let x = Math.round(registros/20)
        this.setState({maxPages: x})
    }
    
    nextPage(){
        if(this.state.page===this.state.maxPages){
            return ''
        } else {
            return this.state.page+1
        }
    }

    prevPage(){
        if(this.state.page===1){
            return ''
        } else {
            return this.state.page-1
        }
    }

    ordenar(e){
        let list = this.state.filtered
        list.sort((a,b) => (a[e.value] > b[e.value]) ? 1 : ((b[e.value] > a[e.value]) ? -1 : 0))
        this.setState({filtered: list, ordenado: e})
    }

 render() {
    let Data = this.state.filtered
    let listData = Data.map(this.createItems)
    let logou = localStorage.getItem("logou");
    let bar = this.appBar(this.state.show);
    const ordenacao = [{ value: 'CODIGO_REPRESENTADA', label: 'Código' }, { value: 'NOME_REPRESENTADA', label: 'Descrição' }]
    if (logou === "true") {
    return (     
              <div className="App">
                {bar}
                <div className="App__Form">
                    <div className="FormCenter">
                        <div className="FormTitle">
                            <Clock format={'DD/MM/YYYY - HH:mm'} ticking={true}/> 
                            <br/>
                            Última sincronização: {localStorage.getItem("macrosync") ? date2str(localStorage.getItem("macrosync")) : 'Nunca sincronizado.'}<br/>
                            <div style={{ display: this.state.qtd.nOrcamentos>0 ? 'block' : 'none' }}>Orçamentos no mês atual: {this.state.qtd.nOrcamentos}</div>
                            <div style={{ display: this.state.qtd.nPedidos>0 ? 'block' : 'none' }}>Pedidos não sincronizados: {this.state.qtd.nPedidos}</div>
                            <div style={{ display: this.state.qtd.nClientes>0 ? 'block' : 'none' }}>Clientes não sincronizados: {this.state.qtd.nClientes}</div>
                            <h1 className="FormTitle__Link--Active">Produtos</h1>
                        </div>
                        {/* <form className="FormFields">   */}
                            <div>
                                Filtro:
                                    <div className='box_inverted'> 
                                        <div className="FormField">
                                            <label className="FormFilter__Label" htmlFor="CODIGO_REPRESENTADA">Código do Produto</label>
                                            <input type="text" id="CODIGO_REPRESENTADA" className="FormFilter__Input" 
                                            name="CODIGO_REPRESENTADA" value={this.state.filter.CODIGO_REPRESENTADA || ''} onChange={this.handleChange}/>
                                            <br/>
                                            <label className="FormFilter__Label" htmlFor="NOME_REPRESENTADA">Descrição do Produto</label>
                                            <input type="text" id="NOME_REPRESENTADA" className="FormFilter__Input" 
                                            name="NOME_REPRESENTADA" value={this.state.filter.NOME_REPRESENTADA || ''} onChange={this.handleChange}/>
                                            <div>
                                                <button className="FormField__Button" onClick={this.handleRefresh}>Pesquisar</button>  
                                                <button className="FormField__Button" onClick={this.handleClean}>Limpar</button>                                                 
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='box_inverted'>
                                    R1 = SP, SC, RS, MG e RJ<br/>
                                    R2 = Demais Estados<br/>
                                    R3 = PE<br/>
                                    R4 = AL, BA, CE, MA, PI, PB, RN e SE<br/>
                                </div>
                                <div className="FormField">
                                    <Dropdown options={ordenacao} onChange={this.ordenar} value={this.state.ordenado} className="FormField__Dropdown" placeholder="Ordenação" />
                                </div>
                            <div>
                                
                                <br/>
                                {this.hideShow()}
                                {/* <LinkContainer to={"/clientes/registro"}><button className="FormField__Button__Fix" onClick={this.handleShow}><SvgIcon className='FormField__Icon__Fix' size={24} icon={plus}/></button></LinkContainer>                        */}
                            </div>

                            <div>                    
                                <ListGroup>
                                    {listData}
                                </ListGroup>
                            </div> 
                            <div> 
                                {this.paginacao()}
                            </div>
                        {/* </form>  */}
                    </div>
                </div>
            </div>

    );} else { return <Redirect exact to="/macropecas/"/>}
  }
}




export default Example;
