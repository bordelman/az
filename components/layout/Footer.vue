<template>
  <section class="footer">
    <NuxtLink to="/soldiers">Přehled vojáků</NuxtLink>
    <NuxtLink to="/soldiers/new">Založit vojáka</NuxtLink>
    <NuxtLink to="/">Přehled cvičení</NuxtLink>
    <NuxtLink to="/drills/new">Založit cvičení</NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: space-around;
  margin: 10px;
}
</style>