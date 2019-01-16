import React, { Component } from 'react';
import {server, cryptmd5} from './Utils'

// import { Link, Router, Route, Redirect } from 'react-router-dom';
// import {browserHistory} from 'react-router';
// import axios from 'axios';



class EntrarForm extends Component {

    constructor(){
        super();

        this.state = {
            user:'',
            password:''
        };

        this.logado = false;
        
        this.handleChange = this.handleChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit (e) {
        e.preventDefault();
        console.log(this.state.user, this.state.password, cryptmd5(this.state.password))
        if ((this.state.user!=='') && (this.state.password!=='')){
            
            fetch(server+'/login/'+this.state.user+'/'+cryptmd5(this.state.password)).then(r => {return r.json()}).then(r => {
                this.logado=false;
                console.log(cryptmd5(this.state.password))
                if (Object.keys(r).length > 0){
                    if (r[0]["PK_VEN"] !== '') {
                        this.logado=true
                        this.props.history.push('/macropecas/home') 
                        localStorage.setItem("macropecas", r[0]["PK_VEN"]);                  
                    }

                }
                if (this.logado === false) {
                    alert('Login/senha incorreto(s)!')
                }
                console.log(this.logado)
                localStorage.setItem("logou", this.logado);
                // console.log(r[0]["PK_VEN"])
                // localStorage.setItem("macropecas", r[0]["PK_VEN"]);
                window.location.reload()
            })
        }
    }
    


    handleChange(e){
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name

        this.setState({
            [name]: value
        });
    }

    handleUserChange(e){
        let target = e.target
        let value = target.type === 'checkbox' ? target.checked : target.value
        let name = target.name

        value = value.replace(/\D/g,'');

        this.setState({
            [name]: value
        });
    
    }
    
    componentWillMount(){
        let logou = localStorage.getItem("logou");
        if (logou === "true") {this.props.history.push('/macropecas/home')}
    }
  
   
    render(){
        
        return(
            <div className="App">
                <div className="App__Form__Login">         
                        <div className="MeiaTela">
                            <div className="App__Aside__Login">
                                {/* <div className="App__Aside__BG"></div> */}
                                    <img src='logo.png' className='App__Aside__BG' alt='Delphus'/>
                            </div>

                        </div>
                        <div className="MeiaTela">
                        <form className="MeiaTela" onSubmit={this.handleSubmit}>
                            <div className="FormFields__Login">
                                <div className="FormField">
                                    {/* <label className="FormField__Label" htmlFor="user">CPF ou CNPJ</label> */}
                                    <input type="text" id="user" className="FormField__Input__Login" 
                                    placeholder="CPF ou CNPJ" name="user"
                                    value={this.state.user} onChange={this.handleUserChange}/>
                                </div>
                                <div className="FormField">
                                    {/* <label className="FormField__Label" htmlFor="password">Senha</label> */}
                                    <input type="password" id="password" className="FormField__Input__Login" 
                                    placeholder="Senha" name="password" 
                                    value={this.state.password} onChange={this.handleChange}/>
                                </div>
                                <div className="FormField">
                                    <input type="submit" className="FormField__Button__Login mr-20" value="Entrar" onSubmit={this.handleSubmit}/>
                                    {/* <button type="submit" className="FormField__Button mr-20">Entrar</button>  */}
                                    {/* <Link to="/entrar" className="FormField__Button mr-20">Sair</Link> */}
                                </div>
                            </div>
                        </form>
                        </div>

                    </div>
                </div>

        );
    }
}

export default EntrarForm;