import { fetchDataByName } from "./fetchData.js";
import { formatPokemonData } from "./formatData.js";

export async function getPokemonDataByName(pokemonNameOrId) {
  try {
    // Fetch raw API data for the given Pokémon
    const rawData = await fetchDataByName(pokemonNameOrId);

    // Format raw data into simplified object
    const formattedData = formatPokemonData(rawData);

    // Return the formatted JSON object
    return formattedData;
  } catch (error) {
    console.error(`Error getting data for: ${pokemonNameOrId}`, error);
    // You may want to return null or throw further, depending on your app
    return null;
  }
}

getPokemonDataByName("charmeleon").then((data) => console.log(data));
