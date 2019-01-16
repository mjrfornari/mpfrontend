import React from "react";
// import { render } from "react-dom";
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
import { date2str, pegaQtdOrcamento } from "./Utils";
// Import React Table
// import ReactTable from "react-table";
import "react-table/react-table.css";
import {versao} from '../App'




class Example extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      pages: null,
      qtd: 0,
      loading: true,
      show: true
    };
    this.show = false;
    this.handleExit = this.handleExit.bind(this);
  }

   componentDidMount(){
        pegaQtdOrcamento().then(res => {
            this.setState({
                qtd: res
            })
        })
    }


  handleExit(e){
    localStorage.setItem("logou", false);  
    console.log('a')  
    this.props.history.push('../') 
  }

  render() {
    // const { data, pages, loading } = this.state;
    let logou = localStorage.getItem("logou");
    console.log('a '+logou)
    if (logou === "true") {
    return (
        <div className="App">
                <div className="App__Aside">
                    {/* <div className="App__Aside__BG"></div> */}
                    <div> 
                        <SideNav highlightColor='var(--cor-letra)' highlightBgColor='var(--cor-menu)' defaultSelected='home' 
                        onItemSelection={ (id, parent) => {
                            if (id==='exit'){  
                                localStorage.setItem("logou", false);    
                                this.props.history.push('/macropecas/')
                            } else this.props.history.push('/macropecas/'+id)
                        }}>       
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
                <div className="App__Form">
                    <div className="FormCenter">
                        <form className="FormFields">
                        <div className="FormTitle"> 
                            <Clock format={'DD/MM/YYYY - HH:mm'} ticking={true}/> 
                            <br/>
                            Última sincronização: {localStorage.getItem("macrosync") ? date2str(localStorage.getItem("macrosync")) : 'Nunca sincronizado.'}<br/>
                            <div style={{ display: 'block' }}>Versão do Aplicativo: {versao}</div>
                            <div style={{ display: this.state.qtd.nOrcamentos>0 ? 'block' : 'none' }}>Orçamentos no mês atual: {this.state.qtd.nOrcamentos}</div>
                            <div style={{ display: this.state.qtd.nPedidos>0 ? 'block' : 'none' }}>Pedidos não sincronizados: {this.state.qtd.nPedidos}</div>
                            <div style={{ display: this.state.qtd.nClientes>0 ? 'block' : 'none' }}>Clientes não sincronizados: {this.state.qtd.nClientes}</div>
                            <h1 className="FormTitle__Link--Active">Bem vindo!</h1>

                        </div>
                        <div className="FormField">
                           
                        </div>
                        </form>
                    </div>
                </div>
            </div>


    );} else { return <Redirect exact to="/macropecas/"/>}
  }
}

export default Example;