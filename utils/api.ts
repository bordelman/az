const apiBaseUrl = 'http://localhost:3001/'

export async function getSoldiers(sortBy = 'firstname', direction = 'ASC') {
  try {
    return await (await fetch(`${apiBaseUrl}soldiers?sortBy=${sortBy}&direction=${direction}`)).json()
  } catch (error) {
    console.log(error)
  }
}

export async function getSoldier(soldierId: number) {
  try {
    return await (await fetch(`${apiBaseUrl}soldiers/${soldierId}`)).json()
  } catch (error) {
    console.log(error)
  }
}

export async function createSoldier(soldier: Record<any, any>) {
  try {
    return await (await fetch(`${apiBaseUrl}soldiers`, {
      method: "POST",
      body: JSON.stringify(soldier),
      headers: {
        "Content-Type": "application/json",
      }
    })).json()
  } catch (error) {
    console.log(error);
  }
}

export async function editSoldier(soldier: Record<any, any>) {
  const { id } = soldier
  delete soldier.id
  try {
    return await (await fetch(`${apiBaseUrl}soldiers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(soldier),
      headers: {
        "Content-Type": "application/json",
      }
    })).json()
  } catch (error) {
    console.log(error)
  }
}

export async function getDrill(drillId: number) {
  try {
    return await (await fetch(`${apiBaseUrl}drills/${drillId}`)).json()
  } catch (error) {
    console.log(error)
  }
}

export async function createDrill(drill: Record<any, any>, notNominated = [], nominated = []) {
  try {
    const id = (
      await (
        await fetch(apiBaseUrl + "drills", {
          method: "POST",
          body: JSON.stringify(drill),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json()
    ).id;
    await updateNominations(id, notNominated, nominated);
    useRouter().replace("/drills/" + id);
  } catch (error) {
    window.alert(error);
  }
}

export async function updateDrill(drill: Record<any, any>, notNominated = [], nominated = []) {
  try {
    const id = drill.id
    delete drill.id
    await Promise.all([
      await fetch(`${apiBaseUrl}drills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(drill),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      await updateNominations(id, notNominated, nominated)
    ])
    useRouter().replace("/");
  } catch (error) {
    window.alert(error);
  }
}
export async function removeDrill(id: number) {
  try {
    await (await fetch(`${apiBaseUrl}drills/${id}`, {
      method: "DELETE"
    })).json()
  } catch (error) {

  }
}

export async function updateNominations(id: number, notNominated = [], nominated = []) {
  try {
    await fetch(`${apiBaseUrl}nominations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ notNominated, nominated }),
      headers: {
        "Content-Type": "application/json",
      }
    })
  } catch (error) {
    window.alert(error);
  }
}

export async function getNominated(drillId: number, status?: number) {
  try {
    return await (await fetch(`${apiBaseUrl}nominations/${drillId}/soldiers${status !== undefined ? ('?status=' + status) : ''}`)).json()
  } catch (error) {
    console.log(error);
  }
}

export async function getNominations(soldierId: number, status: number) {
  try {
    return await (await fetch(`${apiBaseUrl}nominations/${soldierId}/drills${status !== undefined ? ('?status=' + status) : ''}`)).json()
  } catch (error) {
    console.log(error)
  }
}

export async function getEnum(enumType: string) {
  try {
    return await (await fetch(`${apiBaseUrl}enums/${enumType}`)).json()
  } catch (error) {
    console.log(error);
  }
}