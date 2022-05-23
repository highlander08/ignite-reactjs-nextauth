// serve para identificar o tipo de erro
export class AuthTokenError extends Error {
  constructor() {
    // o super é a class Pai que no caso é o Error 
    super("Error with authentication token.");
  }
}
// por que quando eu crio uma class de erro eu consigo diferenciar um erro do outros :
