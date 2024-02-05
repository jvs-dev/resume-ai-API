require('dotenv').config();
const express = require('express')
const app = express()
const axios = require('axios');
const apiKey = `${process.env.API_KEY}`;
const apiUrl = 'https://api.openai.com/v1/chat/completions';
const resumos = [
    {
        userid: 1,
        useremail: "test@gmail.com",
        userpassword: "12345678",
        resumes: []
    },
    {
        userid: 2,
        useremail: "test2@gmail.com",
        userpassword: "12345678",
        resumes: []
    }
]
var cors = require('cors')
app.use(cors())








async function enviarPergunta(pergunta, email, password) {
    return new Promise(async (reslove) => {
        try {
            const resposta = await axios.post(apiUrl, {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Você é um assistente virtual.' },
                    { role: 'user', content: `faça o resumo mais breve possível sobre: ${pergunta}. Se o tema do resumo não for bem esclarecido retorne o seguinte texto "Por favor digite um tema mais detalhado"` },
                ],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            });
            resumos.forEach(element => {
                if (element.useremail == email && element.userpassword == password) {
                    element.resumes.push({ text: `${resposta.data.choices[0].message.content}`, id: (element.resumes.length + 1), title: `${pergunta}` })
                }
            });
            reslove(`${resposta.data.choices[0].message.content}`)
        } catch (erro) {
            reslove(`Erro ao enviar pergunta: ${erro.message}`)
        }
    });
}

async function cadastrarUser(email, password) {
    return new Promise(async (reslove) => {
        let exists = false
        resumos.forEach(element => {
            if (element.useremail == email) {
                exists = true
            }
        });
        if (exists == false) {
            resumos.push({
                userid: (resumos.length + 1),
                useremail: `${email}`,
                userpassword: `${password}`,
                resumes: []
            })
            reslove(resumos)
        } else {
            reslove("this account exists")
        }
    });
}

async function loginUser(email, password) {
    return new Promise(async (reslove) => {
        let exists = false
        resumos.forEach(element => {
            if (element.useremail == email && element.userpassword == password) {
                exists = true
            }
        });
        if (exists == true) {
            reslove(resumos)
        } else {
            reslove("this account not exists")
        }
    });
}



app.get('/createresume', function (req, res) {
    enviarPergunta(`${req.query.title}`, `${req.query.login}`, `${req.query.password}`).then(resumes => {
        res.send({ resume: resumes })
    })
})



app.get('/createaccount', function (req, res) {
    cadastrarUser(`${req.query.login}`, `${req.query.password}`).then(resumes => {
        if (resumes != "this account exists") {
            let userData = {}
            resumes.forEach(element => {
                if (element.useremail == req.query.login && element.userpassword == req.query.password) {
                    userData = element
                }
            });
            res.send(userData)
        } else {
            res.send({ message: "this account exists" })
        }
    })
})

app.get('/login', function (req, res) {
    loginUser(`${req.query.login}`, `${req.query.password}`).then(resumes => {
        if (resumes != "this account not exists") {
            let userData = {}
            resumes.forEach(element => {
                if (element.useremail == req.query.login && element.userpassword == req.query.password) {
                    userData = element
                }
            });
            res.send(userData)
        } else {
            res.send({ message: "this account not exists" })
        }
    })
})

app.get('/resumes', function (req, res) {
    res.send(resumos)
})

app.listen(3001)