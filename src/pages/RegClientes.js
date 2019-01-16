import React from "react";
import Clock from 'react-live-clock';
import { Redirect } from 'react-router-dom';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import SvgIcon from 'react-icons-kit';
import {LinkContainer} from 'react-router-bootstrap'
import { ic_account_box } from 'react-icons-kit/md/ic_account_box';
import { ic_home } from 'react-icons-kit/md/ic_home'
import { ic_add_shopping_cart } from 'react-icons-kit/md/ic_add_shopping_cart';
import { ic_exit_to_app } from 'react-icons-kit/md/ic_exit_to_app'
import {ic_build} from 'react-icons-kit/md/ic_build'
import {ic_settings} from 'react-icons-kit/md/ic_settings'
import { readTable, editData, appendData, geraInput, removeAcento, savingItem, date2str, validarCNPJ, duplicidadeCNPJ } from "./Utils";
import {ic_keyboard_arrow_left} from 'react-icons-kit/md/ic_keyboard_arrow_left'
import {ic_keyboard_arrow_right} from 'react-icons-kit/md/ic_keyboard_arrow_right'
import {ic_search} from 'react-icons-kit/md/ic_search'
import Downshift from 'downshift';








class Example extends React.Component {
    constructor(props, context) {
    super(props, context);
    this.state = {
        clientes  : [],
        cidades: [],
        cidade : {display: '', value: '', codigo: ''},
        show: false,
        now : {PK_CLI: 0, RAZAO_SOCIAL: '', NOME_FANTASIA: '', CNPJ: '', FONE1: '', CODIGO_REPRESENTADA:'', CIDADE:'', BAIRRO:'', ENDERECO: '', CEP: '', NUMERO:'', FONE2:'', DDD1:'', DDD2:'', INSCRICAO_ESTADUAL:'', INSCRICAO_MUNICIPAL:'', SUFRAMA:'', EMAIL:'', EMAIL_FINANCEIRO:''},
        append: false,
        isLoading: true,
        id: 0,
        savingShow: {display: 'none'},
        savingPhase: 1,
        ok: false
    };
    this.show = false
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this)
    this.saveBtn = this.saveBtn.bind(this)
    this.hideShow = this.hideShow.bind(this);
    this.handleBar = this.handleBar.bind(this);
    this.appBar = this.appBar.bind(this);
    this.itens = this.itens.bind(this);
    this.salvaComplete = this.salvaComplete.bind(this)
    this.enviaCEP = this.enviaCEP.bind(this);
    this.saving = this.saving.bind(this);
  }
  
    saveBtn(ok) {
        if (ok === false){
            return (<input type="submit" className="FormField__Button mr-20" value="Salvar" onSubmit={this.handleSubmit}/>)
        } else {
            return (<input type="submit" className="FormField__ButtonDisabled mr-20" value="Salvar"/>)
        }
    }

    saving(){
        this.setState({savingShow: {display: 'none'}})
    }

    itens(a,b){
        if (a===b){
            return '✓ '+a.value
        } else {
            return a.value
        }
    }

    appBar(mostra){
        if (mostra){
            return(
                <div className='App__Aside'>
                        <div>   
                            <SideNav highlightColor='var(--cor-letra)' highlightBgColor='var(--cor-menu)' defaultSelected='clientes'
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

    handleBar(e){
        e.preventDefault()
        let showBar = this.state.show
        this.setState({show: !(showBar)})
    }

    validate(evt) {
        var theEvent = evt || window.event;
        // Handle paste
        if (theEvent.type === 'paste') {
            var key = 0;
            key = theEvent.clipboardData.getData('text/plain');
        } else {
        // Handle key press
            key = theEvent.keyCode || theEvent.which;
            key = String.fromCharCode(key);
        }
        var regex = /[0-9]|\./;
        if( !regex.test(key) ) {
            theEvent.returnValue = false;
            if(theEvent.preventDefault) theEvent.preventDefault();
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

    componentDidMount(){
        let pathname = this.props.location.pathname
        if (pathname.includes('clientes')) {           
            if (this.state.isLoading === true) {
                readTable(Data => { this.setState({clientes: Data.data.clientes, isLoading: true})
                    if (this.props.location.pathname !== '/macropecas/clientes/registro') {
                        let ID = this.props.location.pathname.replace('/macropecas/clientes/registro/','');  
                        this.setState({now: Data.data.clientes[ID], id: ID, isLoading: false})  
                        if (Number(Data.data.clientes[ID].PK_CLI) === 0){
                            let listCidades = []
                            Data.data.cidades.forEach((element, elementid) => {
                                if (element.PK_CID === Data.data.clientes[ID].FK_CID){
                                    let cid = {
                                        display : element.NOMECIDADE+' ('+element.UF+')',
                                        value : element.NOMECIDADE+' ('+element.UF+')',
                                        codigo : element.PK_CID
                                    }

                                    this.setState({cidade: cid})
                                }
                                listCidades.push({
                                    display : element.NOMECIDADE+' ('+element.UF+')',
                                    value : element.NOMECIDADE+' ('+element.UF+')',
                                    codigo : element.PK_CID
                                })
                            }); 

                            this.setState({cidades:listCidades.sort((a,b)=>{if (a.display>b.display) {return 1}; if (a.display<b.display) {return -1}; return 0})})
                        } else {alert('Cliente já sincronizado. Edição bloqueada.')
                            this.setState({isLoading: false, ok: true})
                            this.props.history.push('/macropecas/clientes')}
                    } else {
                        let listCidades = []
                        Data.data.cidades.forEach((element, elementid) => {
                            listCidades.push({
                                display : element.NOMECIDADE+' ('+element.UF+')',
                                value : element.NOMECIDADE+' ('+element.UF+')',
                                codigo : element.PK_CID
                            })
                        }); 

                        this.setState({append: true, isLoading: false, cidades:listCidades.sort((a,b)=>{if (a.display>b.display) {return 1}; if (a.display<b.display) {return -1}; return 0})})
                    }
                })
            }
        }
    }

    salvaComplete(selecionado, nomefk, tablename, idItem){
        let reg = this.state.now
        if (nomefk === 'FK_CID'){
            reg[nomefk] = selecionado.codigo
            reg.CIDADE = selecionado.display
            this.setState({now: reg, [tablename]: selecionado})
        }
    }


    // autocomplete(table, reg, tablename, nomefk, button){
    //     return(
    //                                 <Downshift 
    //                                     onChange={selection => {
    //                                         this.salvaComplete(selection, nomefk, tablename)
    //                                         this.setState({['mostra'+nomefk]: false})
    //                                     }}
    //                                     // onStateChange={(changes) => {
    //                                     //     this.setState({ ['mostra'+nomefk]: changes.isOpen });
    //                                     // }}
    //                                     itemToString={item => (item ? item.display : '')}
    //                                     selectedItem={reg}
    //                                     isOpen={this.state['mostra'+nomefk]}
                                       
    //                                     // onSelect={()=>{}}
    //                                     // inputValue={reg.display}
                                        
    //                                 >
    //                                     {({
    //                                     getInputProps,
    //                                     getItemProps,
    //                                     getLabelProps,
    //                                     getMenuProps,
    //                                     isOpen,
    //                                     inputValue,
    //                                     highlightedIndex,
    //                                     selectedItem,
    //                                     }) => (
    //                                     <div>
    //                                         <input className={button ? "CompleteButton": "FormField__Input"} {...getInputProps()} onFocus={(e)=> {e.preventDefault();this.setState({['mostra'+nomefk]: button})}} onBlur={(e)=> {e.preventDefault();this.setState({['mostra'+nomefk]: false})}}/>
    //                                         {button ? (<button className="ButtonComplete" onClick={(e)=>{e.preventDefault();let estado = this.state['mostra'+nomefk]; this.setState({['mostra'+nomefk]: !estado})}}>{this.state['mostra'+nomefk] ? "-":"+"}</button>) : null}
    //                                         <ul {...getMenuProps()} className={isOpen ? "FormField__Complete" : ""}>
    //                                         {isOpen
    //                                             ? table
    //                                                 .filter(item => !inputValue.toUpperCase() || item.value.includes(inputValue.toUpperCase()))
    //                                                 .slice(0,10)
    //                                                 .map((item, index) => {return(
    //                                                 <li className="FormField__List"
    //                                                     {...getItemProps({
    //                                                     key: index,
    //                                                     index,
    //                                                     item,
    //                                                     style: {
    //                                                         backgroundColor: (selectedItem === item) || (highlightedIndex === index) ? 'var(--cor-2)' : 'var(--cor-1)',
    //                                                         color:'var(--cor-letra)',
    //                                                         fontWeight: selectedItem === item ? 'bold' : 'normal',
    //                                                     },
    //                                                     })}
    //                                                 >
    //                                                     <p className='FormField__List__Text'>{this.itens(item,selectedItem)}</p>
    //                                                 </li>
    //                                                 )})
    //                                             : null}
    //                                         </ul>
    //                                     </div>
    //                                     )}
    //                                 </Downshift>
    //     )
    // }

    autocomplete(table, reg, tablename, nomefk, button){
        return(
                                    <Downshift 
                                        onChange={selection => {
                                            this.salvaComplete(selection, nomefk, tablename)
                                            this.setState({['mostra'+nomefk]: false})
                                        }}
                                        // onStateChange={(changes) => {
                                        //     this.setState({ ['mostra'+nomefk]: changes.isOpen });
                                        // }}
                                        itemToString={item => (item ? item.display : '')}
                                        selectedItem={reg}
                                        isOpen={button && this.state['mostra'+nomefk]}
                                       
                                        // onSelect={()=>{}}
                                        // inputValue={reg.display}
                                        
                                    >
                                        {({
                                        getInputProps,
                                        getItemProps,
                                        getLabelProps,
                                        getMenuProps,
                                        isOpen,
                                        inputValue,
                                        highlightedIndex,
                                        selectedItem,
                                        }) => (
                                        <div>
                                            <input className={button ? "CompleteButton": "FormField__Input"} {...getInputProps()} onFocus={(e)=> {e.preventDefault();this.setState({['mostra'+nomefk]: button})}} onBlur={(e)=> {e.preventDefault();this.setState({['mostra'+nomefk]: false})}}/>
                                            {button ? (<button className="ButtonComplete" onClick={(e)=>{e.preventDefault();let estado = this.state['mostra'+nomefk]; this.setState({['mostra'+nomefk]: !estado})}}>{this.state['mostra'+nomefk] ? "-":"+"}</button>) : null}
                                            <ul {...getMenuProps()} className={isOpen ? "FormField__Complete" : ""}>
                                            {isOpen
                                                ? table
                                                    .filter(item => !inputValue.toUpperCase() || item.value.includes(inputValue.toUpperCase()))
                                                    .slice(0,10)
                                                    .map((item, index) => {return(
                                                    <li className="FormField__List"
                                                        {...getItemProps({
                                                        key: index,
                                                        index,
                                                        item,
                                                        style: {
                                                            backgroundColor: (selectedItem === item) || (highlightedIndex === index) ? 'var(--cor-2)' : 'var(--cor-1)',
                                                            color:'var(--cor-letra)',
                                                            fontWeight: selectedItem === item ? 'bold' : 'normal',
                                                        },
                                                        })}
                                                    >
                                                        <p className='FormField__List__Text'>{this.itens(item,selectedItem)}</p>
                                                    </li>
                                                    )})
                                                : null}
                                            </ul>
                                        </div>
                                        )}
                                    </Downshift>
        )
    }

  
    async handleSubmit (e) {
        e.preventDefault();
        if (this.state.ok===false){
            if ( this.state.now.RAZAO_SOCIAL==='' ){
                alert('Informe a Razão Social!')
            } else
            if ( this.state.now.NOME_FANTASIA===''){
                alert('Informe o Nome Fantasia!')
            } else
            if ( !validarCNPJ(this.state.now.CNPJ)  ){
                alert('CNPJ inválido!!')
            } else 
            if ( await duplicidadeCNPJ(this.state.now.CNPJ, this.state.append)  ){
                alert('CNPJ já cadastrado!!')
            } else 
            if ( (this.state.now.FK_CID === 0) || (typeof this.state.now.FK_CID === 'undefined') ){
                alert('Informe a cidade!')
            } else {
            // console.log('a') 
                this.setState({savingPhase: 1, savingShow:{}})
                if (this.state.ok ===false){
                    if (this.state.append === true) {
                        appendData('clientes', this.state.now, res => {this.setState({savingPhase: 2, savingShow:{}})})    
                        this.setState({ok: true})    
                    } else {
                        editData('clientes', this.state.now, this.state.id, res => {this.setState({savingPhase: 2, savingShow:{}})})
                        this.setState({ok: true})  
                    }
                }
            }
        }
    }

  handleChange(e){
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name
        if (name !== 'PK_CLI'){
            let reg = this.state.now
            reg[name] = value.toUpperCase()
                this.setState({
                    now : reg
                })
        }
  }

    enviaCEP(e){
        e.preventDefault()
        if (this.state.now.CEP.length >= 8){
            let cep = this.state.now.CEP
            fetch('https://viacep.com.br/ws/'+cep.replace(/[^\d]/, '')+'/json/').then(r => r.json()).then(r => {
                if (r.erro !== true){
                    console.log(r)
                    let bairro = removeAcento(r.bairro).toUpperCase()
                    let logradouro = removeAcento(r.logradouro).toUpperCase()
                    let localidade = removeAcento(r.localidade).toUpperCase()
                    let uf = removeAcento(r.uf).toUpperCase()
                    let registro = this.state.now
                    let cid = this.state.cidade
                    let cidades = this.state.cidades.filter((value) => {return (value.display === localidade+' ('+uf+')')})
                    if (typeof cidades[0] !== 'undefined'){
                        cid = cidades[0]
                    } else {
                        cid.display = localidade+' ('+uf+') - CIDADE NÃO CADASTRADA'
                        cid.value = localidade+' ('+uf+') - CIDADE NÃO CADASTRADA'
                        cid.codigo = null
                    }
                    registro.CIDADE = cid.display
                    registro.BAIRRO = bairro
                    registro.ENDERECO = logradouro
                    registro.NUMERO = ''
                    this.salvaComplete(cid, 'FK_CID', 'cidade')
                    this.setState({now: registro, cidade: cid})
                } else {
                    alert('CEP inválido!')
                    let cid = this.state.cidade
                    let registro = this.state.now
                    cid.display = 'OUTROS (RS)'
                    cid.value = 'OUTROS (RS)'
                    cid.codigo = 179
                    registro.CIDADE = ''
                    registro.BAIRRO = ''
                    registro.ENDERECO = ''
                    registro.NUMERO = ''
                    this.setState({now: registro, cidade: cid})
                }
            })
        }
    }

 render() {
    let cidades = []
    if (typeof this.state.cidades === 'undefined'){
        cidades = []
    } else { cidades = this.state.cidades }
    let bar = this.appBar(this.state.show);
    let logou = localStorage.getItem("logou");
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
                                    <h1 className="FormTitle__Link--Active">Registro de Clientes</h1>
                                </div>
                                {geraInput('PK_CLI','CÓDIGO',this.state.now.PK_CLI || '', ()=>{})}
                                <form className="FormFields" onSubmit={this.handleSubmit}>
                                <div className="FormField">
                                    <label className="FormField__Label" htmlFor="RAZAO_SOCIAL">Razão Social</label>
                                    <input autoComplete="off" type="text" id="RAZAO_SOCIAL" className="FormField__Input" 
                                    name="RAZAO_SOCIAL" value={this.state.now.RAZAO_SOCIAL || ''} onChange={this.handleChange}/>
                                </div>
                                <div className="FormField">
                                    <label className="FormField__Label" htmlFor="NOME_FANTASIA">NOME FANTASIA</label>
                                    <input autoComplete="off" type="text" id="NOME_FANTASIA" className="FormField__Input" 
                                    name="NOME_FANTASIA" value={this.state.now.NOME_FANTASIA || ''} onChange={this.handleChange}/>
                                </div>
                                <div className="FormField">
                                    <label className="FormField__Label" htmlFor="CNPJ">CNPJ</label>
                                    <input autoComplete="off" type="text" id="CPNJ" className="FormField__Input"
                                     pattern="\d{14}" maxLength="14" title="Digite somente os números do CNPJ (14 dígitos)"
                                     name="CNPJ" value={this.state.now.CNPJ || ''} onChange={this.handleChange}/>
                                </div>
                                {geraInput('INSCRICAO_ESTADUAL','INSCRIÇÃO ESTADUAL',this.state.now.INSCRICAO_ESTADUAL || '', this.handleChange)}
                                {geraInput('INSCRICAO_MUNICIPAL','INSCRIÇÃO MUNICIPAL',this.state.now.INSCRICAO_MUNICIPAL || '', this.handleChange)}
                                {geraInput('SUFRAMA','SUFRAMA',this.state.now.SUFRAMA || '', this.handleChange)}
                                ENDEREÇO
                                <div className='box_inverted'>
                                    <div className="FormField">
                                        <label className="FormField__Label" htmlFor="CEP">CEP</label>
                                        <input autoComplete="off" type="text" id="CEP" onKeyPress={this.validate} className="FormField__Input" style={{width: '100px'}}
                                        name="CEP" value={this.state.now.CEP} onChange={this.handleChange}/>
                                        <button id='buscaCEP' className='ButtonIcon' onClick={this.enviaCEP}><SvgIcon style={{transform: 'translate(0%, 30%)'}} size={26} icon={ic_search}/></button>
                                    </div>
                                    {geraInput('ENDERECO','LOGRADOURO',this.state.now.ENDERECO || '', this.handleChange)}
                                    {geraInput('NUMERO','Nº',this.state.now.NUMERO || '', this.handleChange, '100px')}
                                    {geraInput('BAIRRO','BAIRRO',this.state.now.BAIRRO || '', this.handleChange)}
                                    {/* {geraInput('CIDADE','CIDADE',this.state.now.CIDADE || '', this.handleChange)} */}
                                    <div className="FormField">
                                        <label className="FormField__Label" htmlFor="CIDADE">CIDADE</label>
                                        {this.autocomplete(cidades, this.state.cidade, 'cidade', 'FK_CID')}
                                    </div>
                                </div>
                                CONTATO
                                <div className='box_inverted'>
                                    <div className="FormField">
                                        <label className="FormField__Label" htmlFor="FONE1">FONE 1</label>
                                        <input autoComplete="off" type="text" id="DDD1" className="FormField__Input" style={{width: '60px', margin: '0px 5px 0px 0px'}}
                                        name="DDD1" value={this.state.now.DDD1 || ''} onChange={this.handleChange}/>
                                        <input autoComplete="off" type="text" id="FONE1" className="FormField__InputTelefone"
                                        name="FONE1" value={this.state.now.FONE1 || ''} onChange={this.handleChange}/>
                                    </div>
                                    <div className="FormField">
                                        <label className="FormField__Label" htmlFor="FONE2">FONE 2</label>
                                        <input autoComplete="off" type="text" id="DDD2" className="FormField__Input" style={{width: '60px', margin: '0px 5px 0px 0px'}}
                                        name="DDD2" value={this.state.now.DDD2 || ''} onChange={this.handleChange}/>
                                        <input autoComplete="off" type="text" id="FONE2" className="FormField__InputTelefone"
                                        name="FONE2" value={this.state.now.FONE1 || ''} onChange={this.handleChange}/>
                                    </div>
                                    {geraInput('EMAIL','EMAIL NFE',this.state.now.EMAIL || '', this.handleChange)}
                                    {geraInput('EMAIL_FINANCEIRO','EMAIL FINANCEIRO',this.state.now.EMAIL_FINANCEIRO || '', this.handleChange)}
                                </div>

                                {savingItem(this.state.savingShow, this.state.savingPhase, this.saving)}
                                {this.hideShow()}
                                <LinkContainer to="/macropecas/clientes"><button className="FormField__Button mr-20">Voltar</button></LinkContainer>
                                {this.saveBtn(this.state.ok)}
                            </form>
                            </div>
                        </div>
                    </div>
            )
    } else { return <Redirect exact to="/macropecas/"/>}
  }
}




export default Example;
