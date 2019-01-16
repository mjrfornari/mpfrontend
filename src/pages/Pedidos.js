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
import {LinkContainer} from 'react-router-bootstrap'
import { readTable, deleteData, garanteDate, now, date2str, deletingItem, server, pegaQtdOrcamento } from "./Utils";
import {plus} from 'react-icons-kit/fa/plus'
import Dropdown from 'react-dropdown'
import {ic_keyboard_arrow_left} from 'react-icons-kit/md/ic_keyboard_arrow_left'
import {ic_keyboard_arrow_right} from 'react-icons-kit/md/ic_keyboard_arrow_right'
import moment from 'moment'













class Example extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            pedidos  : [],
            show: false,
            filter:  {
                RAZAO_SOCIAL: '',
                DATA_MIN: now(-30),
                DATA_MAX: now(0),
                STATUS: '',
                TIPO: ''
            },
            filtered: [],
            detailed: false,
            qtd: [],
            iddetailed: 0,
            op: 'r',
            deletingShow: {display: 'none'},
            deletingPhase: 1,
            page: 1,
            inputPage: 1,
            maxPages: 1
        };
        this.show = false;
        this.handleRefresh = this.handleRefresh.bind(this);
        this.applyFilter = this.applyFilter.bind(this);
        this.createItems = this.createItems.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleExcluir = this.handleExcluir.bind(this);
        this.handleClean = this.handleClean.bind(this);
        this.hideShow = this.hideShow.bind(this);
        this.handleBar = this.handleBar.bind(this);
        this.appBar = this.appBar.bind(this);
        this.geraPdf = this.geraPdf.bind(this);
        this.filtroStatus = this.filtroStatus.bind(this);
        this.filtroTipo = this.filtroTipo.bind(this);
        this.setPage = this.setPage.bind(this);
        this.calcPages = this.calcPages.bind(this);
        this.masterDetail = this.masterDetail.bind(this)
        this.paginacao = this.paginacao.bind(this)
        this.deleting = this.deleting.bind(this)

    }


    componentDidMount(){
        let nOrcs = 0
        pegaQtdOrcamento().then(res => {
            nOrcs = res
        })
        readTable(Data => {
            let pedidosread = Data.data.pedidos
            pedidosread.forEach((item, index)=>{
                item.READ = index
            })
            this.setState({pedidos: pedidosread, filtered: [], qtd: nOrcs})
            let restoreFilter = sessionStorage.getItem("macropFilter");
            if ((restoreFilter !== '' && restoreFilter !== null) && typeof restoreFilter !== 'undefined') {
                let restore = JSON.parse(restoreFilter)
                console.log(restore)
                if (restore.tela === 'pedidos'){
                    this.setState({filter: restore.filtro})
                    console.log(this.state.pedidos)
                    this.applyFilter();
                } else {sessionStorage.removeItem('macropFilter')}
            }      
        })
    }
    

    masterDetail(id){
        if (id === this.state.iddetailed){
            this.setState({detailed: !(this.state.detailed)})
        } else {
            this.setState({detailed: true, iddetailed: id})
        }
    }

    createSons(item, id){
        return(
            <ListGroupItem href="#" key={id} className="FormField__Grid">
                Código: {item.CODIGOPRO}<br/>
                Descrição: {item.DESCRICAOPRO}<br/>
                Quantidade: {item.QUANTIDADE}<br/>
                IPI: {item.IPI+'%'}<br/>
                Valor: {'R$ '+item.VALOR.toFixed(2)}<br/>
                Valor ICMS: {'R$ '+(item.VALOR_STICMS ? item.VALOR_STICMS.toFixed(2) : '0.00')}<br/>
            </ListGroupItem>
        )
    }

    deleting(){
        this.setState({deletingShow: {display: 'none'}})
    }

    handleExcluir(e) {
        e.preventDefault()
        let table = this.state.pedidos
        // console.log(this.state.clientes[e.target.id])
        let result = window.confirm('Confirma a exclusão do pedido?')
        if (result) {
            this.setState({deletingPhase: 1, deletingShow:{}})
            let removed = table.splice(e.target.id, 1)
            this.setState({pedidos: table, iddetailed:0, detailed:false})
            this.applyFilter()
            deleteData('pedidos',removed, e.target.id).then((res) => {
                this.setState({deletingPhase: 2, deletingShow:{}})
            })
            
        }
    }

    geraPdf(e){
        e.stopPropagation();
        // e.preventDefault();
        // reqPdf(e.target.id)
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

    paginacao(){
        console.log('Paginação:',this.state.maxPages, this.state.pedidos.length)
        if (this.state.maxPages>1){
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
                    let listItens = []
                    if (typeof item.itens !== 'undefined'){
                        listItens = item.itens.map(this.createSons)}
                    else listItens = (<ListGroupItem className="FormField__Grid">Nenhum item.</ListGroupItem>)
                    return   (
                        <ListGroupItem href="#" key={item.READ} className="FormField__GridDetailed" onClick={() => {this.masterDetail(id)}}>
                            Cliente: {item.RAZAO_SOCIAL}<br/>
                            {garanteDate(item.DATA)}<br/>
                            Condição de Pagamento: {item.NOMECPG}<br/>
                            {item.NUMPED ? 'Nº Bosch: '+item.NUMPED:'Nº Bosch: 0'}<br/>
                            Nº Web: {item.NUMWEB || 0}<br/>
                            Tipo: {(item.ORCAMENTO==='N') ? 'Pedido' : 'Orçamento' }<br/>
                            Valor: {'R$ '+item.VALOR_INFORMADO.toFixed(2)}<br/>
                            Enviado para Macropeças: {(item.PK_PED>0) ? 'Sim' : 'Não' }<br/>
                            Valor Produtos: {'R$ '+item.VALOR_CALCULADO.toFixed(2)}<br/>
                            Valor Ipi: {'R$ '+item.VALOR_IPI.toFixed(2)}<br/>
                            Valor ST ICMS: {'R$ '+item.VALOR_ST.toFixed(2)}<br/>
                            <div>
                                Itens:
                                <LinkContainer to={"/macropecas/pedidos/registro/"+item.READ}>
                                    <ListGroup>
                                        {listItens}
                                    </ListGroup>
                                </LinkContainer>  
                            </div>
                            <LinkContainer to={"/macropecas/pedidos/registro/"+item.READ}><button className="Grid__Button">Editar</button></LinkContainer>
                            {/* <LinkContainer to={"/macropecas/pedidos/registro/r"+item.READ}><button className="Grid__Button">Replicar</button></LinkContainer> */}
                            <button className={((Number(item.PK_PED) === 0 && item.ORCAMENTO === 'N') || (item.ORCAMENTO === 'S' && item.WEB === 'S')) ? "Grid__Button" : "Grid__Button__Hide"} id={item.READ} onClick={this.handleExcluir}>Excluir</button> 
                            <div><a href={server+'/gerapdf?ped='+item.PK_PED} download='pedido.pdf'><img src='pdf.svg' align="right" className={(item.PK_PED>0) ? 'Pdf_Logo_Detailed' : 'Pdf_Logo_Hide'} alt='Download PDF' id={item.PK_PED} onClick={this.geraPdf}/></a></div>                           
                        </ListGroupItem>
                    )
                } else {
                    return (
                       <ListGroupItem componentclass='div' href="#" key={item.READ} className="FormField__Grid" onClick={() => {this.masterDetail(id)}}>
                            Cliente: {item.RAZAO_SOCIAL}<br/>
                            {garanteDate(item.DATA)}<br/>
                            Condição de Pagamento: {item.NOMECPG}<br/>
                            {item.NUMPED ? 'Nº Bosch: '+item.NUMPED:'Nº Bosch: 0'}<br/>
                            Nº Web: {item.NUMWEB || 0}<br/>
                            Tipo: {(item.ORCAMENTO==='N') ? 'Pedido' : 'Orçamento' }<br/>
                            Valor: {'R$ '+item.VALOR_INFORMADO.toFixed(2)}<br/>
                            Enviado para Macropeças: {(item.PK_PED>0) ? 'Sim' : 'Não' }<br/>
                            <LinkContainer to={"/macropecas/pedidos/registro/"+item.READ}><button className="Grid__Button">Editar</button></LinkContainer>
                            {/* <LinkContainer to={"/macropecas/pedidos/registro/r"+item.READ}><button className="Grid__Button">Replicar</button></LinkContainer> */}
                            <button className={((Number(item.PK_PED) === 0 && item.ORCAMENTO === 'N') || (item.ORCAMENTO === 'S' && item.WEB === 'S')) ? "Grid__Button" : "Grid__Button__Hide"} id={item.READ} onClick={this.handleExcluir}>Excluir</button> 
                            <a href={server+'/gerapdf?ped='+item.PK_PED} download='pedido.pdf'><img src='pdf.svg' align="right" className={(item.PK_PED>0) ? 'Pdf_Logo' : 'Pdf_Logo_Hide'} alt='Download PDF' id={item.PK_PED} onClick={this.geraPdf}/></a>
                        </ListGroupItem>
                    )
                }
            } else {
                return (
                    <ListGroupItem componentclass='div' href="#" key={item.READ} className="FormField__Grid" onClick={() => {this.masterDetail(id)}}>
                        Cliente: {item.RAZAO_SOCIAL}<br/>
                        {garanteDate(item.DATA)}<br/>
                        Condição de Pagamento: {item.NOMECPG}<br/>
                        {item.NUMPED ? 'Nº Bosch: '+item.NUMPED:'Nº Bosch: 0'}<br/>
                        Nº Web: {item.NUMWEB || 0}<br/>
                        Tipo: {(item.ORCAMENTO==='N') ? 'Pedido' : 'Orçamento' }<br/>
                        Valor: {'R$ '+item.VALOR_INFORMADO.toFixed(2)}<br/>
                        Enviado para Macropeças: {(item.PK_PED>0) ? 'Sim' : 'Não' }<br/>
                        <LinkContainer to={"/macropecas/pedidos/registro/"+item.READ}><button className="Grid__Button">Editar</button></LinkContainer>
                        {/* <LinkContainer to={"/macropecas/pedidos/registro/r"+item.READ}><button className="Grid__Button">Replicar</button></LinkContainer> */}
                        <button className={((Number(item.PK_PED) === 0 && item.ORCAMENTO === 'N') || (item.ORCAMENTO === 'S' && item.WEB === 'S')) ? "Grid__Button" : "Grid__Button__Hide"} id={item.READ} onClick={this.handleExcluir}>Excluir</button> 
                        <a href={server+'/gerapdf?ped='+item.PK_PED} download='pedido.pdf'><img src='pdf.svg' align="right" className={(item.PK_PED>0) ? 'Pdf_Logo' : 'Pdf_Logo_Hide'} alt='Download PDF' id={item.PK_PED} onClick={this.geraPdf}/></a>
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
                            <SideNav highlightColor='var(--cor-letra)' highlightBgColor='var(--cor-menu)' defaultSelected='pedidos'
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




    handleChange(e){
        e.preventDefault()
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name
        console.log(value)
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
        let dados = this.state.pedidos
        console.log(dados)
        let filtro = this.state.filter
        console.log(filtro)
        // console.log(filtro)
        let restoreFilter = {tela: 'pedidos', filtro: filtro}
        sessionStorage.setItem('macropFilter', JSON.stringify(restoreFilter))
        console.log(filtro)
        let filtrados = []
        let datamax = new Date(filtro.DATA_MAX+'T23:59:59')
        let datamin = new Date(filtro.DATA_MIN+'T00:00:00')
        
        dados.forEach(element => {
            let data = new Date (element.DATA.split('T')[0]+'T12:00:00')
            let maior = true
            let menor = true
            // console.log(data)
            // console.log(datamax)
            // console.log(datamin)
            if (!isNaN(datamax.getTime())) {
                if (moment(data).isSameOrBefore(datamax)){
                    maior = true
                } else maior = false
            }
            if (!isNaN(datamin.getTime())) {
                if (moment(data).isSameOrAfter(datamin)){
                    menor = true
                } else menor = false
            }
            if (JSON.stringify(element.RAZAO_SOCIAL).toUpperCase().includes(filtro.RAZAO_SOCIAL.toUpperCase()) && maior && menor){
                        filtrados.push(element)
            }
        });
        if (filtro.STATUS === 'S' || filtro.STATUS === 'N'){
            filtrados = filtrados.filter((value) => {if (filtro.STATUS === 'S') { console.log(value.PK_PED, filtro.STATUS, '>0'); return value.PK_PED > 0} else {console.log(value.PK_PED, filtro.STATUS, '=0'); return Number(value.PK_PED)===0}})
        } 
        if (filtro.TIPO === 'O' || filtro.TIPO === 'P'){
            filtrados = filtrados.filter((value) => {if (filtro.TIPO === 'O') {return value.ORCAMENTO==='S'} else {return value.ORCAMENTO==='N'}})
        } 
        filtrados = filtrados.sort((a,b)=>{ 
            if (a.DATA>b.DATA) {return 1} 
            if (a.DATA<b.DATA) {return -1} 
            return 0
        })
        this.calcPages(Object.keys(filtrados).length)
        this.setState({filtered: filtrados}) 
    }

    handleClean(e){
        // let dados = this.state.pedidos
        let filtro = {
            RAZAO_SOCIAL: '',
            DATA_MIN: now(-30),
            DATA_MAX: now(0),
            STATUS: '',
            TIPO: ''
        }
        let filtrados = []
        // console.log(filtro)
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
        let x = Math.ceil(registros/20)
        this.setState({maxPages: x})
    }

    filtroStatus(e){
        let filtro = this.state.filter
        filtro.STATUS = e.value
        this.setState({filter: filtro})
    }

    filtroTipo(e){
        let filtro = this.state.filter
        filtro.TIPO = e.value
        this.setState({filter: filtro})
    }

    render() {
        // console.log(server)
        let Data = this.state.filtered
        let listData = Data.map(this.createItems)
        let logou = localStorage.getItem("logou");
        let bar = this.appBar(this.state.show);
        const statussinc = [{ value: '', label: 'Todos' }, { value: 'N', label: 'Não Sincronizados' }, { value: 'S', label: 'Sincronizados' }]
        const tipos = [{ value: '', label: 'Todos' }, { value: 'O' , label: 'Orçamentos' }, { value: 'P' , label: 'Pedidos' }]
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
                                <h1 className="FormTitle__Link--Active">Pedidos</h1>
                            </div>
                            {/* <form className="FormFields">   */}
                                    <div>
                                        Filtro:
                                        <div className='box_inverted'> 
                                            <div className="FormField" autoComplete="off">
                                                <label className="FormFilter__Label" htmlFor="RAZAO_SOCIAL">Razão Social</label>
                                                <input autoComplete="off" type="text" id="RAZAO_SOCIAL" className="FormFilter__Input" 
                                                name="RAZAO_SOCIAL" value={this.state.filter.RAZAO_SOCIAL || ''} onChange={this.handleChange}/>
                                                <label className="FormFilter__Label">PERÍODO</label>
                                                <input id="DATA_MIN" name="DATA_MIN" className={this.state.show ? 'FormFilter__Date__Show' : 'FormFilter__Date'} type="date" value={this.state.filter.DATA_MIN || ''} onChange={this.handleChange}></input>
                                                <input id="DATA_MAX" name="DATA_MAX" className={this.state.show ? 'FormFilter__Date__Show' : 'FormFilter__Date'} type="date" value={this.state.filter.DATA_MAX || ''} onChange={this.handleChange}></input>
                                                <label className="FormFilter__Label">Status Sincronização:</label>
                                                <Dropdown options={statussinc} name="STATUS" value={this.state.filter.STATUS} onChange={this.filtroStatus} className="FormField__Dropdown__Filter" placeholder="Todos" />
                                                <label className="FormFilter__Label">Tipo:</label>
                                                <Dropdown options={tipos} name="TIPO" value={this.state.filter.TIPO} onChange={this.filtroTipo} className="FormField__Dropdown__Filter" placeholder="Todos" />
                                                <div>
                                                    <button className="FormField__Button" onClick={this.handleRefresh}>Pesquisar</button>  
                                                    <button className="FormField__Button" onClick={this.handleClean}>Limpar</button> 
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <div>
                                    
                                    <br/>
                                    {this.hideShow()}
                                    {deletingItem(this.state.deletingShow, this.state.deletingPhase, this.deleting)}
                                    <LinkContainer to={"/macropecas/pedidos/registro"}><button className="FormField__Button__Fix" onClick={this.handleShow}><SvgIcon className='FormField__Icon__Fix' size={24} icon={plus}/></button></LinkContainer>                       
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
