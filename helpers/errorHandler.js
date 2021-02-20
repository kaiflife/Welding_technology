export const tryCatch = async (func) => {
  try {
    const response = await func();
    return await response.json();
  } catch (e) {
    console.error(`error ${func.name}`, e);
  }
}
