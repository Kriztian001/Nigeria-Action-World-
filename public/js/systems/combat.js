class CombatSystem {
    constructor(scene) {
        this.scene = scene;
    }

    // Attach health properties to an entity (NPC, Player, or Gang member)
    initEntityHealth(entity, maxHp = 100) {
        entity.maxHp = maxHp;
        entity.currentHp = maxHp;
        entity.isInCombat = false;
        
        // Create health bar graphics object container
        entity.healthBar = this.scene.add.graphics();
        entity.healthBar.setVisible(false);
    }

    // Call when entity receives damage
    applyDamage(entity, amount) {
        if (!entity || entity.currentHp <= 0) return;

        entity.currentHp = Math.max(0, entity.currentHp - amount);
        entity.isInCombat = true;
        entity.lastCombatTime = this.scene.time.now;

        this.drawHealthBar(entity);

        if (entity.currentHp === 0) {
            this.handleDeath(entity);
        }
    }

    // Render tiny GTA-style health bar above entity's head
    drawHealthBar(entity) {
        if (!entity.healthBar) return;

        const barWidth = 32;
        const barHeight = 4;
        const offsetY = -28; // Position above head

        entity.healthBar.clear();
        entity.healthBar.setVisible(true);

        // Background (Black Border/Backing)
        entity.healthBar.fillStyle(0x000000, 0.7);
        entity.healthBar.fillRect(entity.x - barWidth / 2, entity.y + offsetY, barWidth, barHeight);

        // Health Fill (Green to Red based on health percentage)
        const healthRatio = entity.currentHp / entity.maxHp;
        const color = healthRatio > 0.5 ? 0x2ecc71 : healthRatio > 0.2 ? 0xf1c40f : 0xe74c3c;

        entity.healthBar.fillStyle(color, 1);
        entity.healthBar.fillRect(entity.x - barWidth / 2, entity.y + offsetY, barWidth * healthRatio, barHeight);
    }

    update() {
        // Auto-hide health bars after 5 seconds out of combat
        const currentTime = this.scene.time.now;
        
        this.scene.npcs?.getChildren().forEach(npc => {
            if (npc.isInCombat) {
                this.drawHealthBar(npc);
                if (currentTime - npc.lastCombatTime > 5000) {
                    npc.isInCombat = false;
                    npc.healthBar.setVisible(false);
                }
            }
        });
    }

    handleDeath(entity) {
        if (entity.healthBar) entity.healthBar.destroy();
        entity.setTint(0x555555); // Darken dead entity
        entity.body.setVelocity(0, 0);
        entity.disableBody(true, false);
    }
}
