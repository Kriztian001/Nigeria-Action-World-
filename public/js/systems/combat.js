class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }

  initEntityHealth(entity, maxHp = 100) {
    entity.maxHp = maxHp;
    entity.currentHp = maxHp;
    entity.isConfronted = false; // Hidden by default
    entity.lastConfrontedTime = 0;

    // Create 2D HTML floating health bar element anchored over head
    const barElem = document.createElement('div');
    barElem.className = 'floating-hp-bar';
    barElem.style.cssText = `
      position: absolute; width: 44px; height: 6px; background: rgba(0,0,0,0.8);
      border: 1px solid #000; border-radius: 3px; display: none; pointer-events: none;
      z-index: 25000; transform: translate(-50%, -100%);
    `;

    const fillElem = document.createElement('div');
    fillElem.style.cssText = `width: 100%; height: 100%; background: #22c55e; border-radius: 2px; transition: width 0.15s;`;
    barElem.appendChild(fillElem);
    
    document.body.appendChild(barElem);
    entity.hpBarElem = barElem;
    entity.hpFillElem = fillElem;
  }

  // Trigger when player attacks, aims, or confronts an entity
  confrontEntity(entity, damageAmount = 0) {
    if (!entity || entity.currentHp <= 0) return;

    entity.isConfronted = true;
    entity.lastConfrontedTime = performance.now();

    if (damageAmount > 0) {
      entity.currentHp = Math.max(0, entity.currentHp - damageAmount);
    }

    this.updateBarUI(entity);

    if (entity.currentHp === 0) {
      this.handleDeath(entity);
    }
  }

  updateBarUI(entity) {
    if (!entity.hpBarElem) return;

    const ratio = entity.currentHp / entity.maxHp;
    entity.hpFillElem.style.width = `${ratio * 100}%`;
    entity.hpFillElem.style.background = ratio > 0.5 ? '#22c55e' : ratio > 0.25 ? '#facc15' : '#ef4444';
  }

  update(camera) {
    const now = performance.now();

    this.scene.npcs?.forEach(npc => {
      if (!npc.hpBarElem) return;

      // Hide bar after 5 seconds out of confrontation
      if (npc.isConfronted && now - npc.lastConfrontedTime > 5000) {
        npc.isConfronted = false;
        npc.hpBarElem.style.display = 'none';
      }

      if (npc.isConfronted && npc.mesh) {
        // Project 3D NPC head coordinate onto 2D screen coordinate
        const headPos = npc.mesh.position.clone();
        headPos.y += 2.1; // Overhead offset

        const screenPos = headPos.clone().project(camera);
        if (screenPos.z < 1) {
          const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

          npc.hpBarElem.style.display = 'block';
          npc.hpBarElem.style.left = `${x}px`;
          npc.hpBarElem.style.top = `${y}px`;
        } else {
          npc.hpBarElem.style.display = 'none';
        }
      }
    });
  }

  handleDeath(entity) {
    if (entity.hpBarElem) entity.hpBarElem.remove();
    if (entity.mesh) {
      entity.mesh.rotation.z = Math.PI / 2; // Knock down entity
    }
  }
}
