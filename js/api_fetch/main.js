import { fetchDataByName, fetchAllPokemon } from "./fetchData.js";
import { formatPokemonByNameData, formatAllPokemonData } from "./formatData.js";

export async function getPokemonDataByName(pokemonName) {
  try {
    const rawData = await fetchDataByName(pokemonName);
    const formattedData = formatPokemonByNameData(rawData);
    return formattedData;
  } catch (error) {
    console.error(`Error getting data for: ${pokemonName}`, error);
    return null;
  }
}

export async function getPAllPokemon(limit = 100000) {
  try {
    const rawData = await fetchAllPokemon(limit);
    const formattedData = formatAllPokemonData(rawData);
    return formattedData;
  } catch (error) {
    console.error(`Error getting all Pokemon data:`, error);
    return null;
  }
}

getPokemonDataByName("pikachu").then((data) => console.log(data));
getPAllPokemon(12).then((data) => console.log(data));
