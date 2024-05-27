function formatarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  cep = cep.replace(/^(\d{2})(\d)/, '$1.$2');
  cep = cep.replace(/\.(\d{3})(\d)/, '.$1-$2');
  return cep;
}

function consultarCEP() {
  var cep = document.getElementById('cepInput').value;
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) {
      alert('CEP inválido. Digite apenas os números.');
      return;
  }

  axios.get('https://viacep.com.br/ws/' + cep + '/json/')
      .then(function (response) {
          var data = response.data;
          if (!data.erro) {
              document.getElementById('resultadoCEP').innerHTML = `
                  <thead>
                      <tr>
                          <th scope="col">Rua</th>
                          <th scope="col">Bairro</th>
                          <th scope="col">Cidade</th>
                          <th scope="col">Estado</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>${data.logradouro}</td>
                          <td>${data.bairro}</td>
                          <td>${data.localidade}</td>
                          <td>${data.uf}</td>
                      </tr>
                  </tbody>`;
          } else {
              alert('CEP não encontrado.');
          }
      })
      .catch(function (error) {
          console.error('Erro ao consultar CEP:', error);
          alert('Erro ao consultar CEP. Por favor, tente novamente.');
      });
}

function consultarEndereco() {
  var estado = document.getElementById('estadoInput').value;
  var cidade = document.getElementById('cidadeInput').value;
  var rua = document.getElementById('ruaInput').value;

  rua = rua.trim().replace(/\s+/g, '+');

  axios.get(`https://viacep.com.br/ws/${estado}/${cidade}/${rua}/json/`)
      .then(function (response) {
          var data = response.data;
          var tableBody = document.getElementById('resultadoEndereco').getElementsByTagName('tbody')[0];
          tableBody.innerHTML = '';

          data.forEach(function (endereco) {
              var row = tableBody.insertRow();
              row.insertCell().textContent = endereco.cep;
              row.insertCell().textContent = endereco.logradouro;
              row.insertCell().textContent = endereco.bairro;
              row.insertCell().textContent = endereco.localidade;
              row.insertCell().textContent = endereco.uf;
          });
      })
      .catch(function (error) {
          console.error('Erro ao consultar endereço:', error);
          alert('Erro ao consultar endereço. Por favor, tente novamente.');
      });
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded foi acionado!");  

  document.getElementById('cepInput').addEventListener('input', function (event) {
      var input = event.target;
      var formatted = formatarCEP(input.value);
      document.getElementById('cepFormatado').textContent = formatted;
  });

  axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(function (response) {
          console.log(response);  
          var states = response.data;
          createOptions(states);
      })
      .catch(function (error) {
          console.log(error);
      });
});

function createOptions(states) {
  var select = document.querySelector('.form-states');
  select.innerHTML = '';
  select.innerHTML += '<option value="" selected disabled>--- Selecione o Estado ---</option>';

  states.forEach(function (state) {
      select.innerHTML += '<option value="' + state.sigla + '">' + state.nome + '</option>';
  });

  select.addEventListener('change', function () {
      var selectedState = states.find(function (state) {
          return state.sigla === select.value;
      });
      if (selectedState) {
          createCityOptions(selectedState);
          document.querySelector('.form-citys').removeAttribute('disabled');
      }
  });
}

function createCityOptions(uf) {
  var select = document.querySelector('.form-citys');
  select.innerHTML = '';
  select.innerHTML += '<option value="" disabled selected>--- Selecione a Cidade ---</option>';

  axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + uf.sigla + '/municipios')
      .then(function (response) {
          var citys = response.data;

          citys.forEach(function (city) {
              select.innerHTML += '<option value="' + city.nome + '">' + city.nome + '</option>';
          });
      })
      .catch(function (error) {
          console.log(error);
      });
}