import type {INomination, ISoldier, EAttendance, IParking} from "~/types";

const apiBaseUrl = 'http://localhost:8000/api/';

// AUTH

export async function logIn(login: string, password: string) {
  try {
    const response = await fetch(`${apiBaseUrl}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({login, password})
    });
    if (response.status === 200) {
      const result = await response.json();

      document.cookie = `army_access_token=${result.accessToken};path=/`;
      useState("logged").value = result;
    } else {
      throw new Error((await response.json()).message);
    }
  } catch (error) {
    window.alert(error.message);
  }
}

export async function autoLogIn() {
  try {
    const response = await fetch(`${apiBaseUrl}auth/auto-login`, {
      headers: {
        Authorization: getBearerToken()
      }
    });
    if (response.status === 200) {
      const result = await response.json();

      document.cookie = `army_access_token=${result.accessToken};path=/`;
      useState("logged").value = result;
    }
  } catch (error) {
    window.alert(error.message);
  }
}

// SOLDIERS
export async function createSoldier(soldier: Record<any, any>) {
  try {
    return await (await fetch(`${apiBaseUrl}soldiers`, {
      method: "POST",
      body: JSON.stringify(soldier),
      headers: {
        Authorization: getBearerToken(),
        "Content-Type": "application/json",
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

export async function getSoldiers(params: Record<string, string>): Promise<Array<ISoldier>> {
  const query = new URLSearchParams(params);
  try {
    return await (await fetch(`${apiBaseUrl}soldiers/search?${query}`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function editSoldier(soldier: Record<any, any>) {
  const {personalNumber} = soldier;
  try {
    return await (await fetch(`${apiBaseUrl}soldiers/${personalNumber}`, {
      method: "PATCH",
      body: JSON.stringify(soldier),
      headers: {
        Authorization: getBearerToken(),
        "Content-Type": "application/json",
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

export async function getNominations(personalNumber: string): Promise<Array<INomination>> {
  try {
    return await (await fetch(`${apiBaseUrl}soldiers/${personalNumber}/nominations`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    window.alert(error);
    console.log(error);
    return [];
  }
}

// DRILLS
export async function createDrill(drill: Record<any, any>, nominated: Array<number>): Promise<boolean> {
  try {
    const response = await fetch(apiBaseUrl + "drills", {
      method: "POST",
      body: JSON.stringify(drill),
      headers: {
        Authorization: getBearerToken(),
        "Content-Type": "application/json"
      },
    }),
      {message, id} = await response.json();

    if (!response.ok) {
      throw new Error(message);
    }
    await updateDrillNominations(id, nominated);
    return id;
  } catch (error) {
    window.alert(error);
    return false
  }
}

export async function getDrills(params?: Record<string, any>) {
  const query = new URLSearchParams(params);
  try {
    return await (await fetch(`${apiBaseUrl}drills/search?${query}`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

export async function getDrillNominations(drillId: string, status?: number): Promise<Array<INomination>> {
  try {
    return await (await fetch(`${apiBaseUrl}drills/${drillId}/nominations${status !== undefined ? ('?status=' + status) : ''}`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function updateDrillNominations(id: number, nominated: Array<number>) {
  try {
    await fetch(`${apiBaseUrl}drills/${id}/nominations`, {
      method: "PUT",
      body: JSON.stringify({nominated}),
      headers: {
        Authorization: getBearerToken(),
        "Content-Type": "application/json",
      }
    });
  } catch (error) {
    window.alert(error);
  }
}

export async function updateDrill(drill: Record<any, any>, nominated: Array<number>): Promise<boolean> {
  try {
    const id = drill.id;
    delete drill.id;
    await Promise.all([
      fetch(`${apiBaseUrl}drills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(drill),
        headers: {
          Authorization: getBearerToken(),
          "Content-Type": "application/json",
        },
      }),
      updateDrillNominations(id, nominated)
    ]);
    return id;
  } catch (error) {
    window.alert(error);
    return false;
  }
}

export async function removeDrill(id: number) {
  try {
    await (await fetch(`${apiBaseUrl}drills/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

export async function reactToNomination(drillId: string, attendance: EAttendance, parking?: IParking) {
  try {
    return await (await fetch(`${apiBaseUrl}drills/${drillId}/nomination`, {
      method: "PATCH",
      body: JSON.stringify({attendance, parking}),
      headers: {
        Authorization: getBearerToken(),
        "Content-Type": "application/json",
      }
    }
    )).json();
  } catch (error) {
    console.log(error);
  }
}

// ENUMS
export async function getRanks() {
  try {
    return await (await fetch(`${apiBaseUrl}enums/ranks`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

export async function getPositions() {
  try {
    return await (await fetch(`${apiBaseUrl}enums/positions`, {
      headers: {
        Authorization: getBearerToken()
      }
    })).json();
  } catch (error) {
    console.log(error);
  }
}

function getBearerToken() {
  return "Bearer " + document
    .cookie
    .split(";")
    .find(cookie => cookie.includes("army_access_token"))
    ?.trim()
    .replace("army_access_token=", "");
}
